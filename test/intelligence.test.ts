import assert from 'assert';
import { buildCanonicalJourney, blocker, normalizeEvents, recommendation, state } from '../lib/intelligence';
import { projectKeyHasAnyPrefix, projectKeyPrefix } from '../lib/keys';
import type { ActivationEvent } from '@/packages/shared/src/events';

function buildEvent(partial: Partial<ActivationEvent>): ActivationEvent {
  return {
    id: partial.id ?? crypto.randomUUID(),
    projectKey: partial.projectKey ?? 'proj_test',
    name: partial.name ?? 'trial_started',
    anonymousId: partial.anonymousId ?? 'anon_user',
    sessionId: partial.sessionId ?? 'session_1',
    occurredAt: partial.occurredAt ?? new Date().toISOString(),
    url: partial.url,
    referrer: partial.referrer,
    properties: partial.properties ?? {},
  };
}

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

runTest('deduplicates events by id', () => {
  const events = [
    buildEvent({ id: 'evt-1', name: 'trial_started', occurredAt: '2026-01-01T00:00:00.000Z' }),
    buildEvent({ id: 'evt-1', name: 'trial_started', occurredAt: '2026-01-01T00:00:00.000Z' }),
  ];

  const normalized = normalizeEvents(events);

  assert.strictEqual(normalized.length, 1);
  assert.strictEqual(normalized[0].id, 'evt-1');
});

runTest('excludes checkout_started before activation from canonical events', () => {
  const journey = buildCanonicalJourney([
    buildEvent({ id: 'evt-trial', name: 'trial_started', occurredAt: '2026-01-01T00:00:00.000Z' }),
    buildEvent({ id: 'evt-checkout', name: 'checkout_started', occurredAt: '2026-01-01T01:00:00.000Z' }),
    buildEvent({ id: 'evt-activate', name: 'first_map_generated', occurredAt: '2026-01-01T02:00:00.000Z' }),
  ]);

  assert.strictEqual(journey.events.some((event) => event.name === 'checkout_started'), false);
  assert.strictEqual(journey.invalidEvents.some((event) => event.name === 'checkout_started'), true);
  assert.strictEqual(state(journey), 'activated');
});

runTest('ensures later funnel stages do not exceed earlier stages', () => {
  const journey = buildCanonicalJourney([
    buildEvent({ id: 'evt-trial', name: 'trial_started', occurredAt: '2026-01-01T00:00:00.000Z' }),
    buildEvent({ id: 'evt-connect', name: 'repository_connected', occurredAt: '2026-01-01T01:00:00.000Z' }),
    buildEvent({ id: 'evt-checkout', name: 'checkout_started', occurredAt: '2026-01-01T02:00:00.000Z' }),
  ]);

  assert.strictEqual(journey.events.some((event) => event.name === 'checkout_started'), false);
  assert.notStrictEqual(state(journey), 'checkout_started');
  assert.strictEqual(state(journey), 'stuck');
});

runTest('does not produce paid without a verified webhook payment event', () => {
  const journey = buildCanonicalJourney([
    buildEvent({ id: 'evt-trial', name: 'trial_started', occurredAt: '2026-01-01T00:00:00.000Z' }),
    buildEvent({ id: 'evt-activate', name: 'first_map_generated', occurredAt: '2026-01-01T01:00:00.000Z' }),
    buildEvent({ id: 'evt-pay', name: 'payment_completed', occurredAt: '2026-01-01T02:00:00.000Z', properties: { verified: false } }),
  ]);

  assert.strictEqual(journey.events.some((event) => event.name === 'payment_completed'), false);
  assert.strictEqual(state(journey), 'activated');
});

runTest('produces paid with a verified webhook payment event', () => {
  const journey = buildCanonicalJourney([
    buildEvent({ id: 'evt-trial', name: 'trial_started', occurredAt: '2026-01-01T00:00:00.000Z' }),
    buildEvent({ id: 'evt-activate', name: 'first_map_generated', occurredAt: '2026-01-01T01:00:00.000Z' }),
    buildEvent({ id: 'evt-pay', name: 'payment_completed', occurredAt: '2026-01-01T02:00:00.000Z', properties: { verified: true } }),
  ]);

  assert.strictEqual(journey.events.some((event) => event.name === 'payment_completed'), true);
  assert.strictEqual(state(journey), 'paid');
});

runTest('returns no recommendation when there is no blocker', () => {
  const journey = buildCanonicalJourney([
    buildEvent({ id: 'evt-trial', name: 'trial_started', occurredAt: '2026-01-01T00:00:00.000Z' }),
    buildEvent({ id: 'evt-connect', name: 'repository_connected', occurredAt: '2026-01-01T01:00:00.000Z' }),
    buildEvent({ id: 'evt-activate', name: 'first_map_generated', occurredAt: '2026-01-01T02:00:00.000Z' }),
  ]);

  assert.strictEqual(blocker(journey), undefined);
  assert.strictEqual(recommendation(journey), undefined);
});

runTest('extracts the complete prefix from current project keys', () => {
  const rawKey = 'pk_live_project123_secretvalue';

  assert.strictEqual(projectKeyPrefix(rawKey), 'pk_live_project123');
  assert.strictEqual(projectKeyPrefix('pk_live_project123'), 'pk_live_project123');
  assert.strictEqual(projectKeyHasAnyPrefix(rawKey, ['pk_live_project123']), true);
  assert.strictEqual(projectKeyHasAnyPrefix('pk_live_project123', ['pk_live_project123']), true);
  assert.strictEqual(projectKeyHasAnyPrefix(rawKey, ['pk']), false);
});

runTest('keeps legacy project keys compatible with scoped filtering', () => {
  const rawKey = 'pk_project123_secretvalue';

  assert.strictEqual(projectKeyPrefix(rawKey), 'pk_project123');
  assert.strictEqual(projectKeyHasAnyPrefix(rawKey, ['pk_project123']), true);
});
