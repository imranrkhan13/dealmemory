import assert from 'assert';
import { buildCanonicalJourney, blocker, normalizeEvents, recommendation, state } from '../lib/intelligence';
import { projectKeyHasAnyPrefix, projectKeyPrefix } from '../lib/keys';
import { signupSchema } from '../lib/auth';
import { activationEventSchema, containsCredential, stripUrlQuery } from '@/packages/shared/src/events';
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

runTest('validates password length cap (71, 72, 73 bytes, and multibyte)', () => {
  // 71 UTF-8 bytes (ASCII) -> valid
  assert.strictEqual(signupSchema.safeParse({ email: 'user@example.com', password: 'a'.repeat(71) }).success, true);

  // 72 UTF-8 bytes (ASCII) -> valid
  assert.strictEqual(signupSchema.safeParse({ email: 'user@example.com', password: 'a'.repeat(72) }).success, true);

  // 73 UTF-8 bytes (ASCII) -> rejected
  const res73 = signupSchema.safeParse({ email: 'user@example.com', password: 'a'.repeat(73) });
  assert.strictEqual(res73.success, false);
  if (!res73.success) {
    assert.strictEqual(res73.error.issues[0].message, 'Password must be at most 72 UTF-8 bytes');
  }

  // Multibyte: Euro sign '€' is 3 UTF-8 bytes. 24 * 3 = 72 bytes -> valid
  const euro24 = '€'.repeat(24);
  assert.strictEqual(Buffer.byteLength(euro24, 'utf8'), 72);
  assert.strictEqual(signupSchema.safeParse({ email: 'user@example.com', password: euro24 }).success, true);

  // Multibyte: 25 * 3 = 75 bytes -> rejected
  const euro25 = '€'.repeat(25);
  assert.strictEqual(Buffer.byteLength(euro25, 'utf8'), 75);
  const resEuro = signupSchema.safeParse({ email: 'user@example.com', password: euro25 });
  assert.strictEqual(resEuro.success, false);
  if (!resEuro.success) {
    assert.strictEqual(resEuro.error.issues[0].message, 'Password must be at most 72 UTF-8 bytes');
  }

  // Multibyte: Rocket '🚀' is 4 UTF-8 bytes. 18 * 4 = 72 bytes -> valid, 19 * 4 = 76 bytes -> rejected
  assert.strictEqual(signupSchema.safeParse({ email: 'user@example.com', password: '🚀'.repeat(18) }).success, true);
  assert.strictEqual(signupSchema.safeParse({ email: 'user@example.com', password: '🚀'.repeat(19) }).success, false);
});

runTest('secret value scanner rejects fake secrets across all targeted credential shapes and never leaks values', () => {
  // Table of fake secrets built dynamically at runtime (avoiding static pattern matches)
  const fakeSecrets: Array<{ name: string; secret: string }> = [
    { name: 'pk_live key', secret: 'fake_' + 'pk_live_' + 'k'.repeat(30) },
    { name: 'sk_live key', secret: 'fake_' + 'sk_live_' + 's'.repeat(30) },
    { name: 'whsec secret', secret: 'fake_' + 'whsec_' + 'w'.repeat(32) },
    { name: 'bearer token', secret: 'Bearer ' + 'tok_' + 't'.repeat(25) },
    { name: 'jwt token', secret: 'eyJ' + 'header'.repeat(3) + '.' + 'eyJ' + 'payload'.repeat(3) + '.' + 'sig'.repeat(8) },
    { name: 'pem block', secret: '-----BEGIN ' + 'RSA PRIVATE KEY-----\n' + 'm'.repeat(40) + '\n-----END RSA PRIVATE KEY-----' },
    { name: 'password assignment', secret: 'password=' + 'pass_' + 'p'.repeat(12) },
    { name: 'token assignment', secret: 'token=' + 'tok_' + 't'.repeat(16) },
    { name: 'secret assignment', secret: 'secret=' + 'sec_' + 's'.repeat(16) },
  ];

  for (const { name, secret } of fakeSecrets) {
    assert.strictEqual(containsCredential(secret), true, `containsCredential should detect ${name}`);

    // Test rejection in properties
    const event = buildEvent({
      properties: { note: secret },
    });
    const parsed = activationEventSchema.safeParse(event);
    assert.strictEqual(parsed.success, false, `Schema must reject event with ${name} in properties`);
    if (!parsed.success) {
      assert.strictEqual(parsed.error.issues[0].message, 'credential_detected');
      // Critical: Ensure error output does not contain the rejected secret value
      const errorJson = JSON.stringify(parsed.error.issues);
      assert.strictEqual(errorJson.includes(secret), false, `Error json must not echo secret for ${name}`);
    }

    // Test rejection in URL path
    const urlEvent = buildEvent({
      url: `https://example.invalid/${encodeURIComponent(secret)}`,
      properties: {},
    });
    const parsedUrl = activationEventSchema.safeParse(urlEvent);
    assert.strictEqual(parsedUrl.success, false, `Schema must reject event with ${name} in url path`);
    if (!parsedUrl.success) {
      assert.strictEqual(parsedUrl.error.issues[0].message, 'credential_detected');
      assert.strictEqual(JSON.stringify(parsedUrl.error.issues).includes(secret), false);
    }
  }
});

runTest('secret value scanner accepts normal values without false positives', () => {
  const normalValues: Array<{ name: string; value: string }> = [
    { name: 'uuid', value: crypto.randomUUID() },
    { name: 'sha256 hex', value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
    { name: 'order ref', value: 'order_8F3K29' },
    { name: 'invoice ref', value: 'inv_10928374' },
    { name: 'event name', value: 'trial_started' },
    { name: 'enum value', value: 'enterprise_annual' },
    { name: 'plain sentence', value: 'User completed onboarding and verified their primary email address.' },
    { name: 'word bearer in sentence', value: 'He was the bearer of great news today.' },
  ];

  for (const { name, value } of normalValues) {
    assert.strictEqual(containsCredential(value), false, `Normal value ${name} must not be flagged as credential`);

    const event = buildEvent({
      properties: { ref: value },
    });
    const parsed = activationEventSchema.safeParse(event);
    assert.strictEqual(parsed.success, true, `Normal value ${name} in properties must pass schema validation`);
  }
});

runTest('secret value scanner strips url query params before scanning', () => {
  // Query param has token=something, but cleanUrl/query stripping strips it
  const urlWithQuery = 'https://example.invalid/dashboard?token=xyz123#overview';
  assert.strictEqual(stripUrlQuery(urlWithQuery), 'https://example.invalid/dashboard');

  const event = buildEvent({
    url: urlWithQuery,
    referrer: 'https://example.invalid/referral?secret=abc456',
    properties: { page: 'dashboard' },
  });
  const parsed = activationEventSchema.safeParse(event);
  assert.strictEqual(parsed.success, true, 'Url with credentials only in query parameters must pass schema validation');
});
