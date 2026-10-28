import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { assertLocalDatabase, resetDatabase } from './helpers/db';
import { request } from './helpers/server';
import { POST as signup } from '../app/api/auth/signup/route';
import { POST as batch } from '../app/api/v1/events/batch/route';
import { prisma } from '../lib/db';
import { generateProjectKey } from '../lib/keys';
async function main() {
  assertLocalDatabase();
  await resetDatabase();
  const res = await signup(request('/api/auth/signup', { email: 'integration@example.invalid', password: 'local-fixture-only', name: 'Fictional Integration' }));
  assert.equal(res.status, 200);
  const { project } = await res.json();
  const key = await generateProjectKey('pk_live');
  await prisma.projectApiKey.create({ data: { projectId: project.id, keyPrefix: key.prefix, keyHash: key.keyHash } });
  const events = Array.from({length: 3}, () => ({ id: randomUUID(), projectKey: key.raw, name: 'trial_started', userId: 'imran', anonymousId: 'anonymous-test', sessionId: 'session-test', occurredAt: new Date().toISOString(), properties: {} }));
  const result = await batch(request('/api/v1/events/batch', { events }, key.raw));
  assert.equal(result.status, 200);
  assert.equal((await result.json()).accepted, 3);
  assert.equal(await prisma.activationEvent.count({where:{projectId:project.id}}), 3, 'ingestion must persist the accepted events to Postgres');
  console.log('PASS real signup + ingestion persists three rows');
}
main().finally(() => prisma.$disconnect()).catch(e => { console.error(e); process.exitCode=1; });
