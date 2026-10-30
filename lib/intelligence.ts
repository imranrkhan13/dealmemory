import { ActivationEvent } from '@/packages/shared/src/events';
import { analyzeJourney } from './product-intelligence';
import { events } from './event-store';
import { prisma } from './db';
import {
  extractLastRecordedAction,
  diagnoseOnboarding,
  buildTimelineSequence,
  buildCustomerMemoryCapsule,
  LastActionSummary,
  OnboardingDiagnosis,
  TimelineStep,
  CustomerMemoryCapsule,
} from './customer-memory';

export { events, ingest } from './event-store';
export * from './customer-memory';

export type Journey = {
  userId: string;
  email: string;
  goal?: string;
  rawEvents: ActivationEvent[];
  events: ActivationEvent[];
  invalidEvents: ActivationEvent[];
  lastAction?: LastActionSummary | null;
  onboardingDiagnosis?: OnboardingDiagnosis;
  timeline?: TimelineStep[];
  customerMemory?: CustomerMemoryCapsule;
};
const BLOCKER_WINDOW_MS = 24 * 60 * 60 * 1000;

export function normalizeEvents(events: ActivationEvent[]) {
  const sorted = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const seen = new Set<string>();
  const normalized: ActivationEvent[] = [];

  for (const event of sorted) {
    if (seen.has(event.id)) continue;
    seen.add(event.id);
    normalized.push(event);
  }

  return normalized;
}

export function isRepositoryConnected(event: ActivationEvent) {
  return (
    event.name === 'repository_connected' ||
    event.name === 'integration_connected' ||
    event.name === 'githubconnected'
  );
}

export function isRepositoryConnectionFailed(event: ActivationEvent) {
  return (
    event.name === 'repository_connection_failed' ||
    event.name === 'integration_connection_failed' ||
    event.name === 'githuboauthfailed'
  );
}

export function isActivationEvent(event: ActivationEvent) {
  return (
    event.name === 'first_map_generated' ||
    event.name === 'activation_completed' ||
    event.name === 'first_value_reached' ||
    event.name === 'feature_used' ||
    event.name === 'project_created' ||
    event.name === 'workflow_completed' ||
    event.properties?.milestone === true ||
    event.properties?.activated === true
  );
}

export function isPaymentCompleted(event: ActivationEvent) {
  return event.name === 'payment_completed';
}

export function isVerifiedPayment(event: ActivationEvent) {
  return isPaymentCompleted(event) && event.properties?.verified === true;
}

function findNextEventWithin(
  events: ActivationEvent[],
  index: number,
  predicate: (event: ActivationEvent) => boolean,
  withinMs: number
) {
  const start = new Date(events[index].occurredAt).getTime();
  for (let i = index + 1; i < events.length; i += 1) {
    const next = events[i];
    const nextTime = new Date(next.occurredAt).getTime();
    if (nextTime - start > withinMs) break;
    if (predicate(next)) return next;
  }
  return undefined;
}

export function buildCanonicalJourney(events: ActivationEvent[]): Journey {
  const sorted = normalizeEvents(events);
  const rawEvents = [...sorted];
  const invalidEvents: ActivationEvent[] = [];
  const canonicalEvents: ActivationEvent[] = [];
  let hasActivation = false;

  for (const event of sorted) {
    if (event.name === 'checkout_started') {
      if (!hasActivation) {
        invalidEvents.push(event);
        continue;
      }
      canonicalEvents.push(event);
      continue;
    }

    if (isPaymentCompleted(event) && !isVerifiedPayment(event)) {
      invalidEvents.push(event);
      continue;
    }

    canonicalEvents.push(event);

    if (isActivationEvent(event)) {
      hasActivation = true;
    }
  }

  const firstEvent = sorted[0];
  const userId = firstEvent?.userId ?? firstEvent?.anonymousId ?? 'unknown';
  const email = `${userId}@local`;
  const goalEvent = sorted.find((event) => event.name === 'goal_set');
  const goal = goalEvent ? String(goalEvent.properties?.goal ?? '') : undefined;

  return {
    userId,
    email,
    goal,
    rawEvents,
    events: canonicalEvents,
    invalidEvents,
  };
}

export function state(j: Journey) {
  if (j.events.some(isVerifiedPayment)) return 'paid';
  if (j.events.some((event) => event.name === 'checkout_started')) return 'checkout_started';
  if (j.events.some(isActivationEvent)) return 'activated';
  if (blocker(j)) return 'stuck';
  if (j.events.some(isRepositoryConnected)) return 'active';
  if (j.events.some((event) => event.name === 'trial_started')) return 'trial';
  return 'trial';
}

export function blocker(j: Journey) {
  const events = j.events;

  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];

    if (isRepositoryConnectionFailed(event)) {
      const nextConnected = findNextEventWithin(events, index, isRepositoryConnected, BLOCKER_WINDOW_MS);
      if (!nextConnected) return 'GitHub authorization failed';
    }

    if (isRepositoryConnected(event)) {
      const nextActivation = findNextEventWithin(events, index, isActivationEvent, BLOCKER_WINDOW_MS);
      if (!nextActivation) return 'First value not reached';
    }

    if (event.name === 'checkout_started') {
      const nextPayment = findNextEventWithin(events, index, isVerifiedPayment, BLOCKER_WINDOW_MS);
      if (!nextPayment) return 'Checkout not completed';
    }
  }

  return undefined;
}

export function recommendation(j: Journey) {
  const block = blocker(j);
  if (!block) return undefined;
  if (block === 'GitHub authorization failed') return 'Show the connection recovery guide.';
  if (block === 'First value not reached') return 'Prompt the first-value action.';
  if (block === 'Checkout not completed') return 'Send checkout reminder.';
  return undefined;
}

export function inactiveHours(j: Journey) {
  const e = j.rawEvents[j.rawEvents.length - 1];
  return e ? Math.max(0, Math.round((Date.now() - new Date(e.occurredAt).getTime()) / 3600000)) : 0;
}

export async function journeys(projectId: string) {
  const group = new Map<string, ActivationEvent[]>();
  const allEvents = await events(projectId);
  for (const event of allEvents) {
    const id = event.userId ?? `anon:${event.anonymousId}`;
    group.set(id, [...(group.get(id) ?? []), event]);
  }

  // Load trial user attributes and custom founder notes if available
  const notesMap = new Map<string, string>();
  try {
    const trialUsers = await prisma.trialUser.findMany({
      where: { projectId },
      select: { externalUserId: true, attributes: true },
    });
    for (const tu of trialUsers) {
      if (tu.attributes) {
        try {
          const parsed = JSON.parse(tu.attributes);
          if (parsed?.notes) notesMap.set(tu.externalUserId, String(parsed.notes));
        } catch {}
      }
    }
  } catch {}

  return Array.from(group.entries()).map(([userId, items]) => {
    const journey = buildCanonicalJourney(items);
    const existingNotes = notesMap.get(userId);

    const lastAction = extractLastRecordedAction(items);
    const diagnosis = diagnoseOnboarding(items);
    const timeline = buildTimelineSequence(items);
    const customerMemory = buildCustomerMemoryCapsule(userId, items, existingNotes);

    const baseState = state(journey);
    const legacyBlocker = blocker(journey);
    const finalBlocker = legacyBlocker ?? (diagnosis.isBroke ? diagnosis.brokeAt : undefined);
    const finalRecommendation = recommendation(journey) ?? diagnosis.recommendation;

    return {
      ...journey,
      memories: [],
      insights: analyzeJourney(journey, []),
      recommendation: finalRecommendation,
      state: baseState,
      currentState: baseState,
      blocker: finalBlocker,
      inactiveHours: inactiveHours(journey),
      lastAction,
      onboardingDiagnosis: diagnosis,
      timeline,
      customerMemory,
    };
  });
}
