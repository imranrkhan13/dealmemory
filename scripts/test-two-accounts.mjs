#!/usr/bin/env node

import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { assertLocalDatabase, resetDatabase } from '../test/helpers/db';
import { prisma } from '../lib/db';

const PORT = 3005;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SECRET = 'test-secret-two-accounts-123456';
const DB_URL = process.env.DATABASE_URL || 'postgresql://imran@localhost:5432/dm_test_integration';

process.env.DATABASE_URL = DB_URL;
process.env.NEXTAUTH_SECRET = SECRET;

assertLocalDatabase(DB_URL);

async function waitServerReady(url, maxRetries = 40) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`${url}/api/auth/csrf`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server at ${url} failed to start in time`);
}

async function signInHTTP(baseUrl, email, password) {
  const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  const csrfSetCookie = csrfRes.headers.get('set-cookie') || '';
  const { csrfToken } = await csrfRes.json();

  const csrfCookie = csrfSetCookie.split(';')[0];
  const params = new URLSearchParams({
    csrfToken,
    email,
    password,
    json: 'true',
  });

  const res = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': csrfCookie,
    },
    body: params.toString(),
    redirect: 'manual',
  });

  const setCookies = res.headers.get('set-cookie') || '';
  const sessionMatch = setCookies.match(/next-auth\.session-token=[^;]+/);
  if (!sessionMatch) {
    throw new Error(`Failed to extract session token from response: ${setCookies}`);
  }
  return sessionMatch[0];
}

function runProcess(cmd, args, env = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['inherit', 'pipe', 'pipe'], env: { ...process.env, ...env } });
    let stdout = '';
    let stderr = '';
    p.stdout.on('data', (d) => { stdout += d; });
    p.stderr.on('data', (d) => { stderr += d; });
    p.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${cmd} exited with code ${code}: ${stderr || stdout}`));
    });
  });
}

async function main() {
  console.log('--- Step 7: Multi-Account Real HTTP Isolation Test ---');
  console.log(`Database: ${DB_URL}`);
  await resetDatabase();

  console.log(`Starting Next.js production server on port ${PORT}...`);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    env: {
      ...process.env,
      PORT: String(PORT),
      DATABASE_URL: DB_URL,
      NEXTAUTH_SECRET: SECRET,
      NODE_ENV: 'production',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  server.stderr.on('data', (d) => {
    const s = d.toString();
    if (!s.includes('ExperimentalWarning')) process.stderr.write(s);
  });

  try {
    await waitServerReady(BASE_URL);
    console.log(`Server is ready at ${BASE_URL}`);

    // 1. Create Account A
    console.log('\n1. Creating Account A (Node client)...');
    const signupARes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice@example.invalid', password: 'password_alice_123', name: 'Alice Node' }),
    });
    assert.equal(signupARes.status, 200);
    const dataA = await signupARes.json();
    const projectA = dataA.project;
    console.log(`   Account A created: user=${dataA.user.id}, project=${projectA.id}`);

    // 2. Create Account B
    console.log('\n2. Creating Account B (Python client)...');
    const signupBRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bob@example.invalid', password: 'password_bob_123', name: 'Bob Python' }),
    });
    assert.equal(signupBRes.status, 200);
    const dataB = await signupBRes.json();
    const projectB = dataB.project;
    console.log(`   Account B created: user=${dataB.user.id}, project=${projectB.id}`);

    // 3. Authenticate both accounts via HTTP NextAuth
    console.log('\n3. Authenticating sessions via /api/auth...');
    const cookieA = await signInHTTP(BASE_URL, 'alice@example.invalid', 'password_alice_123');
    console.log('   Account A authenticated successfully');
    const cookieB = await signInHTTP(BASE_URL, 'bob@example.invalid', 'password_bob_123');
    console.log('   Account B authenticated successfully');

    // 4. Create public keys for both accounts
    console.log('\n4. Creating public keys via /api/projects/keys/create...');
    const keyARes = await fetch(`${BASE_URL}/api/projects/keys/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
      body: JSON.stringify({ projectId: projectA.id, kind: 'pk_live' }),
    });
    assert.equal(keyARes.status, 200);
    const keyAData = await keyARes.json();
    console.log(`   Key A created: prefix=${keyAData.prefix}`);

    const keyBRes = await fetch(`${BASE_URL}/api/projects/keys/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookieB },
      body: JSON.stringify({ projectId: projectB.id, kind: 'pk_live' }),
    });
    assert.equal(keyBRes.status, 200);
    const keyBData = await keyBRes.json();
    console.log(`   Key B created: prefix=${keyBData.prefix}`);

    // 5. Separate process: Node SDK client sends events for Account A
    console.log('\n5. Launching separate Node process using packages/sdk for Account A...');
    const nodeOutput = await runProcess('node', [
      'scripts/send-node-events.mjs',
      '--project-key', keyAData.raw,
      '--api-url', `${BASE_URL}/api`,
    ]);
    console.log(`   ${nodeOutput.stdout.trim()}`);

    // 6. Separate process: Python client sends events for Account B
    console.log('\n6. Launching separate Python process using packages/python for Account B...');
    const pyOutput = await runProcess('python3', [
      'scripts/send-python-events.py',
      '--project-key', keyBData.raw,
      '--api-url', `${BASE_URL}/api`,
    ]);
    console.log(`   ${pyOutput.stdout.trim()}`);

    // 7. Verify owned reads with authenticated sessions
    console.log('\n7. Verifying owned reads & tenant isolation via /api/v1/events/recent & /api/v1/journeys...');
    
    // Account A reads Project A
    const eventsARes = await fetch(`${BASE_URL}/api/v1/events/recent?projectId=${projectA.id}`, {
      headers: { 'Cookie': cookieA },
    });
    assert.equal(eventsARes.status, 200);
    const eventsAData = await eventsARes.json();
    const eventNamesA = eventsAData.events.map((e) => e.name);
    console.log(`   Account A events (count: ${eventsAData.events.length}): ${eventNamesA.join(', ')}`);
    assert(eventNamesA.includes('trial_started'), 'Account A must see trial_started');
    assert(eventNamesA.includes('first_map_generated'), 'Account A must see first_map_generated');
    assert(!eventNamesA.includes('meaningful_action'), 'Account A must NOT see Account B meaningful_action');

    const journeysARes = await fetch(`${BASE_URL}/api/v1/journeys?projectId=${projectA.id}`, {
      headers: { 'Cookie': cookieA },
    });
    assert.equal(journeysARes.status, 200);
    const journeysAData = await journeysARes.json();
    console.log(`   Account A journeys: ${journeysAData.journeys.map((j) => j.userId).join(', ')}`);
    assert.equal(journeysAData.journeys.length, 1);
    assert.equal(journeysAData.journeys[0].userId, 'user_alice_node');

    // Account B reads Project B
    const eventsBRes = await fetch(`${BASE_URL}/api/v1/events/recent?projectId=${projectB.id}`, {
      headers: { 'Cookie': cookieB },
    });
    assert.equal(eventsBRes.status, 200);
    const eventsBData = await eventsBRes.json();
    const eventNamesB = eventsBData.events.map((e) => e.name);
    console.log(`   Account B events (count: ${eventsBData.events.length}): ${eventNamesB.join(', ')}`);
    assert(eventNamesB.includes('meaningful_action'), 'Account B must see meaningful_action');
    assert(eventNamesB.includes('goal_set'), 'Account B must see goal_set');
    assert(!eventNamesB.includes('first_value_reached'), 'Account B must NOT see Account A first_value_reached');

    const journeysBRes = await fetch(`${BASE_URL}/api/v1/journeys?projectId=${projectB.id}`, {
      headers: { 'Cookie': cookieB },
    });
    assert.equal(journeysBRes.status, 200);
    const journeysBData = await journeysBRes.json();
    console.log(`   Account B journeys: ${journeysBData.journeys.map((j) => j.userId).join(', ')}`);
    assert.equal(journeysBData.journeys.length, 1);
    assert.equal(journeysBData.journeys[0].userId, 'user_bob_python');

    // Cross-tenant access attempt: Account A tries to read Project B
    console.log('\n8. Testing cross-tenant read restrictions...');
    const crossEventsRes = await fetch(`${BASE_URL}/api/v1/events/recent?projectId=${projectB.id}`, {
      headers: { 'Cookie': cookieA },
    });
    console.log(`   Account A requesting Project B events: HTTP ${crossEventsRes.status} (${(await crossEventsRes.json()).error})`);
    assert.equal(crossEventsRes.status, 403);

    const crossJourneysRes = await fetch(`${BASE_URL}/api/v1/journeys?projectId=${projectB.id}`, {
      headers: { 'Cookie': cookieA },
    });
    console.log(`   Account A requesting Project B journeys: HTTP ${crossJourneysRes.status} (${(await crossJourneysRes.json()).error})`);
    assert.equal(crossJourneysRes.status, 403);

    // Unauthenticated request to owned endpoints
    const unauthEventsRes = await fetch(`${BASE_URL}/api/v1/events/recent?projectId=${projectA.id}`);
    console.log(`   Unauthenticated request to /api/v1/events/recent: HTTP ${unauthEventsRes.status} (${(await unauthEventsRes.json()).error})`);
    assert.equal(unauthEventsRes.status, 401);

    // 9. Key validation & revocation tests
    console.log('\n9. Testing wrong and revoked keys on /api/v1/events/batch...');
    
    // Non-existent key
    const wrongKeyRes = await fetch(`${BASE_URL}/api/v1/events/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-project-key': 'pk_live_nonexistent123_invalidsecretvalue',
      },
      body: JSON.stringify({
        events: [{
          id: 'test-evt-wrong-key',
          projectKey: 'pk_live_nonexistent123_invalidsecretvalue',
          name: 'trial_started',
          anonymousId: 'anon-test',
          sessionId: 'session-test',
          occurredAt: new Date().toISOString(),
          properties: {},
        }],
      }),
    });
    console.log(`   Wrong key request: HTTP ${wrongKeyRes.status} (${(await wrongKeyRes.json()).error})`);
    assert.equal(wrongKeyRes.status, 401);

    // Mismatched tenant key in event body vs header
    const mismatchKeyRes = await fetch(`${BASE_URL}/api/v1/events/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-project-key': keyAData.raw,
      },
      body: JSON.stringify({
        events: [{
          id: 'test-evt-mismatch',
          projectKey: keyBData.raw, // Mismatched key in payload
          name: 'trial_started',
          anonymousId: 'anon-test',
          sessionId: 'session-test',
          occurredAt: new Date().toISOString(),
          properties: {},
        }],
      }),
    });
    console.log(`   Mismatched tenant key request: HTTP ${mismatchKeyRes.status} (${(await mismatchKeyRes.json()).error})`);
    assert.equal(mismatchKeyRes.status, 403);

    // Revoke Account A's key via /api/projects/keys/revoke
    console.log('\n   Revoking Account A key via /api/projects/keys/revoke...');
    const revokeRes = await fetch(`${BASE_URL}/api/projects/keys/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
      body: JSON.stringify({ projectId: projectA.id, prefix: keyAData.prefix }),
    });
    assert.equal(revokeRes.status, 200);
    console.log('   Key revoked successfully');

    // Ingestion with revoked key
    const revokedKeyRes = await fetch(`${BASE_URL}/api/v1/events/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-project-key': keyAData.raw,
      },
      body: JSON.stringify({
        events: [{
          id: 'test-evt-revoked',
          projectKey: keyAData.raw,
          name: 'trial_started',
          anonymousId: 'anon-test',
          sessionId: 'session-test',
          occurredAt: new Date().toISOString(),
          properties: {},
        }],
      }),
    });
    console.log(`   Revoked key request: HTTP ${revokedKeyRes.status} (${(await revokedKeyRes.json()).error})`);
    assert.equal(revokedKeyRes.status, 401);

    console.log('\nPASS: All multi-account real HTTP isolation and key tests PASSED!');
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error('FAIL:', err);
  process.exit(1);
});
