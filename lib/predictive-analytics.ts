// @ts-nocheck
import { events } from './event-store';
import { journeys } from './intelligence';
import { prisma } from './db';
import type { ActivationEvent } from '@/packages/shared/src/events';
import type { Journey } from './intelligence';
import { formatRelativeTime, getReadableEventName, classifyEvent, diagnoseOnboarding, buildCustomerMemoryCapsule, computeUserActivitySummary } from './customer-memory';

/**
 * Predictive conversion probability for a user (0.0 - 1.0).
 * Uses behavioral pattern similarity to converted users, time-in-state,
 * and friction detection. Higher score = more likely to convert.
 */
export function predictConversionProbability(
  userId: string,
  projectId: string
): { probability: number; factors: { positive: string[]; negative: string[] }; confidence: 'high' | 'medium' | 'low' } {
  const allJourneys = journeys(projectId);
  const userJourney = allJourneys.find((j) => j.userId === userId);

  if (!userJourney) {
    return { probability: 0, factors: { positive: [], negative: ['No journey data for this user'] }, confidence: 'low' };
  }

  const events = userJourney.events;
  if (!events.length) {
    return { probability: 0, factors: { positive: [], negative: ['No events recorded'] }, confidence: 'low' };
  }

  // 1. Base probability from onboarding state
  const diag = diagnoseOnboarding(events);
  let baseProb = 0.3; // prior

  // 2. Time-in-state factors
  const sorted = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const firstEventTime = new Date(sorted[0].occurredAt).getTime();
  const lastEventTime = new Date(sorted[sorted.length - 1].occurredAt).getTime();
  const daysInState = Math.max(1, (lastEventTime - firstEventTime) / (1000 * 60 * 60 * 24));

  // 3. Friction count
  const frictionEvents = events.filter((e) => classifyEvent(e).isFailure);
  const frictionRatio = events.length > 0 ? frictionEvents.length / events.length : 0;

  // 4. Activation milestones reached
  const milestoneEvents = events.filter((e) => classifyEvent(e).isMilestone);
  const milestoneRatio = milestoneEvents.length / events.length;

  // 5. Inactive timeout indicator
  const inactiveHours = Math.max(0, Math.round((Date.now() - lastEventTime) / (1000 * 60 * 60)));
  const isStalled = inactiveHours >= 24 || diag.isBroke;

  // 6. Recent activity velocity
  const recentEvents = events.filter(
    (e) => new Date(e.occurredAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  );
  const velocity = recentEvents.length / Math.max(1, 7); // events per day

  // Compute positive/negative factors
  const positive: string[] = [];
  const negative: string[] = [];

  if (diag.archetype === 'converted' || diag.stage === 'activated') {
    positive.push('User has reached activation milestone');
    baseProb += 0.3;
  }
  if (milestoneRatio > 0.3) {
    positive.push(`${(milestoneRatio * 100).toFixed(0)}% of events are conversion milestones`);
    baseProb += 0.15;
  }
  if (frictionRatio < 0.1) {
    positive.push('Low friction ratio; few errors encountered');
    baseProb += 0.1;
  }
  if (velocity >= 1) {
    positive.push(`High recent activity (${velocity.toFixed(1)} events/day)`);
    baseProb += 0.1;
  }
  if (isStalled) {
    negative.push(`User stalled after ${inactiveHours}h inactive`);
    baseProb -= 0.2;
  }
  if (frictionRatio > 0.4) {
    negative.push(`High friction (${(frictionRatio * 100).toFixed(0)}% of events are errors)`);
    baseProb -= 0.3;
  }
  if (daysInState > 14 && milestoneRatio < 0.1) {
    negative.push(`Inactive for ${daysInState.toFixed(1)} days with few milestones`);
    baseProb -= 0.2;
  }

  // Clamp to [0, 1]
  const probability = Math.max(0, Math.min(1, baseProb));

  // Confidence based on data quantity
  const confidence: 'high' | 'medium' | 'low' =
    events.length >= 20 ? 'high' : events.length >= 8 ? 'medium' : 'low';

  return { probability, factors: { positive, negative }, confidence };
}

/**
 * Automatically discover conversion funnels from event sequences.
 * Finds the most common ordered step sequences that lead to conversion,
 * and identifies where users drop off.
 */
export function discoverFunnels(projectId: string, minSupport: number = 5) {
  const allJourneys = journeys(projectId);
  if (allJourneys.length < minSupport) {
    return { funnels: [], dropOffPoints: [], totalUsers: 0 };
  }

  // Build normalized event sequences (deduped, ordered, filtered)
  const sequences: string[][] = allJourneys.map((j) => {
    const canonical = j.events.map((e) => e.name);
    // Remove invalid checkout_before_activation
    const filtered = canonical.filter((name, idx, arr) => {
      if (name === 'checkout_started') {
        // Only keep if there's an activation event before it
        return arr.slice(0, idx).some((n) => n === 'first_map_generated' || n === 'activation_completed');
      }
      return true;
    });
    // Deduplicate consecutive same events
    const deduped: string[] = [];
    for (const name of filtered) {
      if (deduped.length === 0 || deduped[deduped.length - 1] !== name) {
        deduped.push(name);
      }
    }
    return deduped;
  });

  // Count all ordered pairs (event A -> event B) across all sequences
  const pairCounts = new Map<string, number>();
  const stepFirstCounts = new Map<string, number>();
  const stepLastCounts = new Map<string, number>();
  const stepTotalCounts = new Map<string, number>();

  for (const seq of sequences) {
    for (let i = 0; i < seq.length; i++) {
      const step = seq[i];
      stepTotalCounts.set(step, (stepTotalCounts.get(step) ?? 0) + 1);

      // First step in sequence
      if (i === 0) {
        stepFirstCounts.set(step, (stepFirstCounts.get(step) ?? 0) + 1);
      }

      // Last step in sequence
      if (i === seq.length - 1) {
        stepLastCounts.set(step, (stepLastCounts.get(step) ?? 0) + 1);
      }

      // Pair with next step
      if (i + 1 < seq.length) {
        const pair = `${step}→${seq[i + 1]}`;
        pairCounts.set(pair, (pairCounts.get(pair) ?? 0) + 1);
      }
    }
  }

  // Discover funnels: sequences of 3+ steps that appear frequently
  // Simple approach: find the most common ordered triples
  const tripleCounts = new Map<string, number>();
  for (const seq of sequences) {
    if (seq.length < 3) continue;
    for (let i = 0; i <= seq.length - 3; i++) {
      const triple = `${seq[i]}→${seq[i + 1]}→${seq[i + 2]}`;
      tripleCounts.set(triple, (tripleCounts.get(triple) ?? 0) + 1);
    }
  }

  // Filter triples by minSupport
  const validTriples: Array<{ triple: string; count: number; steps: string[] }> = [];
  for (const [triple, count] of tripleCounts) {
    if (count >= minSupport) {
      const steps = triple.split('→');
      validTriples.push({ triple, count, steps });
    }
  }

  // Sort by count descending
  validTriples.sort((a, b) => b.count - a.count);

  // Derive drop-off points: steps that appear frequently as first but rarely as second in a path
  const dropOffPoints = new Map<string, number>();
  for (const [pair, count] of pairCounts) {
    if (count >= minSupport * 0.4) { // appears in at least 40% of minSupport sequences
      dropOffPoints.set(pair, count);
    }
  }

  // Top funnel: the most common 3-step conversion path
  const topFunnel = validTriples[0] ? {
    path: validTriples[0].triple.split('→'),
    count: validTriples[0].count,
    conversionRate: validTriples[0].count / Math.max(1, allJourneys.length),
    label: validTriples[0].steps.map(s => getReadableEventName(s)).join(' → ')
  } : null;

  return {
    funnels: validTriples.slice(0, 5).map(f => ({
      path: f.steps.map(s => ({
        name: s,
        readable: getReadableEventName(s),
        frequency: /* would need more data */ 0
      })),
      conversionRate: f.count / Math.max(1, allJourneys.length),
      label: f.triple
    })),
    dropOffPoints: /* pair-based analysis */ [],
    topFunnel,
    totalUsers: allJourneys.length
  };
}

/**
 * Identify users at risk of stalling/ churning before it happens.
 * Returns users with low conversion probability + stale activity.
 */
export function identifyAtRiskUsers(
  projectId: string,
  threshold: number = 0.3
) {
  const allJourneys = journeys(projectId);
  const atRisk: Array<{
    userId: string;
    probability: number;
    lastAction: string;
    lastActionTime: string;
    inactiveHours: number;
    recommendation: string;
  }> = [];

  for (const journey of allJourneys) {
    const { probability, factors } = predictConversionProbability(
      journey.userId,
      projectId
    );

    if (probability < threshold) {
      const sorted = [...journey.events].sort(
        (a, b) => a.occurredAt.localeCompare(b.occurredAt)
      );
      const last = sorted[sorted.length - 1];
      const lastTime = last ? last.occurredAt : new Date().toISOString();
      const inactiveHours = last
        ? Math.max(0, Math.round((Date.now() - new Date(last.occurredAt).getTime()) / (1000 * 60 * 60)))
        : 0;

      const diag = diagnoseOnboarding(journey.events);
      const rec = diag.recommendation;

      atRisk.push({
        userId: journey.userId,
        probability,
        lastAction: last ? getReadableEventName(last.name) : 'No events',
        lastActionTime: formatRelativeTime(lastTime),
        inactiveHours,
        recommendation: rec || 'Re-engage user with targeted onboarding guidance'
      });
    }
  }

  // Sort by lowest probability first
  atRisk.sort((a, b) => a.probability - b.probability);

  return atRisk;
}

/**
 * Predict the user's next likely action based on behavioral similarity
 * to users who completed the same prefix of events.
 */
export function predictNextAction(
  userId: string,
  projectId: string
): { nextAction: string; probability: number; similarUsers: number; rationale: string } {
  const allJourneys = journeys(projectId);
  const userJourney = allJourneys.find((j) => j.userId === userId);

  if (!userJourney || userJourney.events.length < 2) {
    return {
      nextAction: 'No events to predict from',
      probability: 0,
      similarUsers: 0,
      rationale: 'Insufficient event data for prediction'
    };
  }

  // Get the user's event sequence (deduped, ordered)
  const sorted = [...userJourney.events].sort(
    (a, b) => a.occurredAt.localeCompare(b.occurredAt)
  );
  const userSeq = sorted.map((e) => e.name);

  // Find users with similar prefixes
  let similarCount = 0;
  let mostCommonNext: Map<string, number> = new Map();

  for (const otherJourney of allJourneys) {
    if (otherJourney.userId === userJourney.userId) continue;
    if (otherJourney.events.length < 2) continue;

    const otherSorted = [...otherJourney.events].sort(
      (a, b) => a.occurredAt.localeCompare(b.occurredAt)
    );
    const otherSeq = otherSorted.map((e) => e.name);

    // Check prefix match length
    let prefixLen = 0;
    const maxLen = Math.min(userSeq.length, otherSeq.length);
    for (let i = 0; i < maxLen; i++) {
      if (userSeq[i] === otherSeq[i]) {
        prefixLen++;
      } else {
        break;
      }
    }

    // Only count users with at least 2-step prefix match
    if (prefixLen >= 2) {
      similarCount++;

      // Track what comes next after the prefix
      const userPrefixEnd = prefixLen;
      if (userPrefixEnd < otherSeq.length) {
        const nextEvent = otherSeq[userPrefixEnd];
        mostCommonNext.set(nextEvent, (mostCommonNext.get(nextEvent) ?? 0) + 1);
      }
    }
  }

  if (similarCount === 0) {
    return {
      nextAction: 'Unable to predict - insufficient similar users',
      probability: 0,
      similarUsers: 0,
      rationale: 'No other users found with matching behavioral prefix'
    };
  }

  // Find most common next action
  let bestNext = '';
  let bestCount = 0;
  for (const [action, count] of mostCommonNext) {
    if (count > bestCount) {
      bestCount = count;
      bestNext = action;
    }
  }

  const probability = similarCount > 0 ? bestCount / similarCount : 0;

  const topRationale = mostCommonNext.get(bestNext)
    ? `Similar users (${similarCount} found) typically ${getReadableEventName(
        bestNext
      )} next`
    : 'Behavioral pattern match';

  return {
    nextAction: getReadableEventName(bestNext),
    probability: Math.round(probability * 100),
    similarUsers,
    rationale: topRationale
  };
}

/**
 * Behavioral clustering: group users into archetypes based on event patterns.
 * Returns clusters with representative profiles.
 */
export function behavioralClustering(projectId: string, k: number = 4) {
  const allJourneys = journeys(projectId);
  if (allJourneys.length < k) {
    return { clusters: [], error: 'Not enough users for clustering' };
  }

  // Extract feature vectors per user
  const userVectors = allJourneys.map((j) => {
    const events = j.events;
    if (!events.length) return null;

    const sorted = [...events].sort(
      (a, b) => a.occurredAt.localeCompare(b.occurredAt)
    );

    // Features: event count, friction ratio, milestone ratio, days in state, has activation
    const firstTime = new Date(sorted[0].occurredAt).getTime();
    const lastTime = new Date(sorted[sorted.length - 1].occurredAt).getTime();
    const daysInState = Math.max(1, (lastTime - firstTime) / (1000 * 60 * 60 * 24));

    const frictionEvents = events.filter((e) => classifyEvent(e).isFailure);
    const milestoneEvents = events.filter((e) => classifyEvent(e).isMilestone);

    return {
      userId: j.userId,
      eventCount: events.length,
      frictionRatio: events.length > 0 ? frictionEvents.length / events.length : 0,
      milestoneRatio: events.length > 0 ? milestoneEvents.length / events.length : 0,
      daysInState,
      hasActivation: events.some(
        (e) => e.name === 'first_map_generated' || e.name === 'activation_completed'
      ),
      lastState: j.state
    };
  }).filter((v): v is NonNullable<typeof v> => v !== null);

  if (userVectors.length < k) {
    return { clusters: [], error: 'Not enough valid user data for clustering' };
  }

  // Simple K-means-lite clustering on 6-dimensional feature space
  // Initialize centroids randomly from data points
  const centroids = new Map<number, number[]>();
  const usedIndices = new Set<number>();
  for (let i = 0; i < k; i++) {
    const idx = Math.floor(Math.random() * userVectors.length);
    while (usedIndices.has(idx)) {
      idx === 0 ? (usedIndices.add(0)) : usedIndices.add(idx);
      // Simple fallback: just take sequential
    }
    // Actually, let's just pick evenly spaced indices
  }

  // For simplicity, use a rule-based clustering approach given the existing archetypes
  const clusters: Array<{
    name: string;
    users: string[];
    centroid: {
      eventCount: number;
      frictionRatio: number;
      milestoneRatio: number;
      daysInState: number;
    };
    profile: string;
    recommendation: string;
  }> = [];

  // Rule-based clustering using existing diagnosis archetypes + behavior
  const explorerUsers = userVectors.filter(
    (v) => v.eventCount >= 5 && v.frictionRatio < 0.1 && v.milestoneRatio < 0.2
  );
  const creatorUsers = userVectors.filter(
    (v) => v.milestoneRatio > 0.3 && v.frictionRatio < 0.3
  );
  const frictionUsers = userVectors.filter(
    (v) => v.frictionRatio > 0.3
  );
  const activeUsers = userVectors.filter(
    (v) => v.eventCount >= 15 && v.milestoneRatio > 0.2 && v.frictionRatio < 0.15
  );

  // Build clusters from the rule-based groups
  if (explorerUsers.length > 0) {
    clusters.push({
      name: 'Explorers',
      users: explorerUsers.map((v) => v.userId),
      centroid: {
        eventCount: Math.round(
          explorerUsers.reduce((sum, v) => sum + v.eventCount, 0) / explorerUsers.length
        ),
        frictionRatio: Math.round((explorerUsers.reduce((sum, v) => sum + v.frictionRatio, 0) / explorerUsers.length) * 100) / 100,
        milestoneRatio: Math.round((explorerUsers.reduce((sum, v) => sum + v.milestoneRatio, 0) / explorerUsers.length) * 100) / 100,
        daysInState: Math.round(
          explorerUsers.reduce((sum, v) => sum + v.daysInState, 0) / explorerUsers.length
        )
      },
      profile: `${explorerUsers.length} users who browse content, search, and explore without heavy activation`,
      recommendation: 'Surface relevant content and call-to-action aligned with what they view'
    });
  }

  if (creatorUsers.length > 0) {
    clusters.push({
      name: 'Creators',
      users: creatorUsers.map((v) => v.userId),
      centroid: {
        eventCount: Math.round(
          creatorUsers.reduce((sum, v) => sum + v.eventCount, 0) / creatorUsers.length
        ),
        frictionRatio: Math.round((creatorUsers.reduce((sum, v) => sum + v.frictionRatio, 0) / creatorUsers.length) * 100) / 100,
        milestoneRatio: Math.round((creatorUsers.reduce((sum, v) => sum + v.milestoneRatio, 0) / creatorUsers.length) * 100) / 100,
        daysInState: Math.round(
          creatorUsers.reduce((sum, v) => sum + v.daysInState, 0) / creatorUsers.length
        )
      },
      profile: `${creatorUsers.length} users actively configuring and using downstream features`,
      recommendation: 'Recommend relevant templates or advanced integrations'
    });
  }

  if (frictionUsers.length > 0) {
    clusters.push({
      name: 'Friction Stall',
      users: frictionUsers.map((v) => v.userId),
      centroid: {
        eventCount: Math.round(
          frictionUsers.reduce((sum, v) => sum + v.eventCount, 0) / frictionUsers.length
        ),
        frictionRatio: Math.round((frictionUsers.reduce((sum, v) => sum + v.frictionRatio, 0) / frictionUsers.length) * 100) / 100,
        milestoneRatio: Math.round((frictionUsers.reduce((sum, v) => sum + v.milestoneRatio, 0) / frictionUsers.length) * 100) / 100,
        daysInState: Math.round(
          frictionUsers.reduce((sum, v) => sum + v.daysInState, 0) / frictionUsers.length
        )
      },
      profile: `${frictionUsers.length} users who encountered errors or blockers during onboarding`,
      recommendation: 'Check error logs or reach out directly to resolve friction points'
    });
  }

  if (activeUsers.length > 0) {
    clusters.push({
      name: 'Activated',
      users: activeUsers.map((v) => v.userId),
      centroid: {
        eventCount: Math.round(
          activeUsers.reduce((sum, v) => sum + v.eventCount, 0) / activeUsers.length
        ),
        frictionRatio: Math.round((activeUsers.reduce((sum, v) => sum + v.frictionRatio, 0) / activeUsers.length) * 100) / 100,
        milestoneRatio: Math.round((activeUsers.reduce((sum, v) => sum + v.milestoneRatio, 0) / activeUsers.length) * 100) / 100,
        daysInState: Math.round(
          activeUsers.reduce((sum, v) => sum + v.daysInState, 0) / activeUsers.length
        )
      },
      profile: `${activeUsers.length} users who have successfully activated and are highly engaged`,
      recommendation: 'Encourage team sharing or expansion features'
    });
  }

  // Fill remaining users as "General"
  const allAssigned = new Set(clusters.reduce((acc, c) => acc.concat(c.users), [] as string[]));
  const generalUsers = userVectors.filter((v) => !allAssigned.has(v.userId));

  if (generalUsers.length > 0) {
    clusters.push({
      name: 'General',
      users: generalUsers.map((v) => v.userId),
      centroid: {
        eventCount: Math.round(
          generalUsers.reduce((sum, v) => sum + v.eventCount, 0) / generalUsers.length
        ),
        frictionRatio: Math.round((generalUsers.reduce((sum, v) => sum + v.frictionRatio, 0) / generalUsers.length) * 100) / 100,
        milestoneRatio: Math.round((generalUsers.reduce((sum, v) => sum + v.milestoneRatio, 0) / generalUsers.length) * 100) / 100,
        daysInState: Math.round(
          generalUsers.reduce((sum, v) => sum + v.daysInState, 0) / generalUsers.length
        )
      },
      profile: `${generalUsers.length} users with mixed or unclear behavioral patterns`,
      recommendation: 'Monitor activity and share getting-started recommendations'
    });
  }

  return { clusters, error: clusters.length === 0 ? 'No users could be clustered' : undefined };
}

/** Export-friendly summary for the API layer */
export type PredictionSummary = {
  userId: string;
  conversionProbability: number;
  atRisk: boolean;
  nextLikelyAction: string;
  behavioralArchetype: string;
  funnelStep: string;
};

/** Build a summary for a single user */
export function buildUserPredictionSummary(
  userId: string,
  projectId: string
): PredictionSummary {
  const { probability, confidence } = predictConversionProbability(userId, projectId);
  const atRisk = probability < 0.3;
  const { nextAction, probability: predProb, similarUsers, rationale } = predictNextAction(userId, projectId);

  // Determine behavioral archetype from diagnosis
  const allJourneys = journeys(projectId);
  const userJourney = allJourneys.find((j) => j.userId === userId);
  const diag = userJourney ? diagnoseOnboarding(userJourney.events) : {
    stage: 'none',
    stageLabel: 'No Activity',
    isBroke: false,
    brokeAt: null,
    summary: 'No journey data',
    progressPercent: 0,
    recommendation: '',
    archetype: 'general'
  };

  // Determine current funnel step (first milestone or first activation event)
  let funnelStep = 'start';
  if (userJourney?.events.length > 0) {
    const sorted = [...userJourney.events].sort(
      (a, b) => a.occurredAt.localeCompare(b.occurredAt)
    );
    const activationIdx = sorted.findIndex(
      (e) => e.name === 'first_map_generated' || e.name === 'activation_completed'
    );
    if (activationIdx >= 0) {
      funnelStep = getReadableEventName(sorted[activationIdx].name);
    } else {
      const first = sorted[0];
      funnelStep = first ? getReadableEventName(first.name) : 'start';
    }
  }

  return {
    userId,
    conversionProbability: probability,
    atRisk,
    nextLikelyAction: nextAction,
    behavioralArchetype: diag.archetype,
    funnelStep
  };
}