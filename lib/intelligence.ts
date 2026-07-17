import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { ActivationEvent } from '@/packages/shared/src/events';

export type Journey = {
  userId: string;
  email: string;
  goal?: string;
  rawEvents: ActivationEvent[];
  events: ActivationEvent[];
  invalidEvents: ActivationEvent[];
};

const file = path.join(process.cwd(), 'data', 'activation-events.json');
const BLOCKER_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function events() {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as ActivationEvent[];
  } catch {
    return [];
  }
}

export async function save(value: ActivationEvent[]) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(value, null, 2));
}

import { writeSupermemory } from "@/lib/memory";
export async function ingest(items: ActivationEvent[]) {
    const all = await events();

    const ids = new Set(all.map((x) => x.id));

    const fresh = items.filter((x) => !ids.has(x.id));

    if (fresh.length) {
        await save([...all, ...fresh]);
    }

    const memoryResults = [];

    for (const event of fresh) {
        try {
            switch (event.name) {

                case "goal_set":
                    await writeSupermemory(event.userId!, {
                        category: "goal",
                        content: String(event.properties?.goal ?? ""),
                        source: "productevent",
                        createdAt: event.occurredAt,
                    });

                    memoryResults.push({
                        event: event.name,
                        success: true,
                    });

                    break;

                case "repository_connection_failed":
                    await writeSupermemory(event.userId!, {
                        category: "blocker",
                        content: JSON.stringify({
                            blocker: "Repository connection failed",
                            errorCode: event.properties?.errorCode,
                        }),
                        source: "productevent",
                        createdAt: event.occurredAt,
                    });

                    memoryResults.push({
                        event: event.name,
                        success: true,
                    });

                    break;

                case "repository_connected":
                    await writeSupermemory(event.userId!, {
                        category: "progress",
                        content: "Repository connected successfully.",
                        source: "productevent",
                        createdAt: event.occurredAt,
                    });

                    memoryResults.push({
                        event: event.name,
                        success: true,
                    });

                    break;

                case "first_map_generated":
                    await writeSupermemory(event.userId!, {
                        category: "progress",
                        content: "User reached first map generated.",
                        source: "productevent",
                        createdAt: event.occurredAt,
                    });

                    memoryResults.push({
                        event: event.name,
                        success: true,
                    });

                    break;
            }
        } catch (e) {

            memoryResults.push({
                event: event.name,
                success: false,
                error:
                    e instanceof Error
                        ? e.message
                        : "Supermemory failed",
            });

            // IMPORTANT:
            // don't stop ingestion
        }
    }

    return {
        accepted: fresh.length,
        deduplicated: items.length - fresh.length,
        memory: memoryResults,
    };
}
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
  return event.name === 'first_map_generated' || event.name === 'activation_completed';
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

export async function journeys(projectKey?: string) {
  const all = (await events()).filter((e) => !projectKey || e.projectKey === projectKey);
  const normalized = normalizeEvents(all);
  const group = new Map<string, ActivationEvent[]>();

  for (const event of normalized) {
    const id = event.userId ?? event.anonymousId;
    const current = group.get(id) ?? [];
    current.push(event);
    group.set(id, current);
  }

  return Array.from(group.values()).map((eventsForUser) => buildCanonicalJourney(eventsForUser));
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
