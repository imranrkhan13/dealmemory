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
  const post = (items:typeof events) => batch(request('/api/v1/events/batch',{events:items},key.raw));
  let retry=await post(events); assert.equal((await retry.json()).deduplicated,3);
  const conflict=await post([{...events[0],name:'goal_set'}]); assert.equal(conflict.status,409); assert.equal((await conflict.json()).conflicts[0].reason,'event_id_reused_with_different_payload');
  const parallel={...events[0],id:randomUUID()};
  const same=await Promise.all(Array.from({length:20},()=>post([parallel])));
  assert(same.every(r=>r.status===200));
  assert.equal(await prisma.activationEvent.count({where:{projectId:project.id,eventId:parallel.id}}),1);
  const differentId=randomUUID();
  const different=await Promise.all(Array.from({length:20},(_,i)=>post([{...parallel,id:differentId,properties:{attempt:i}}])));
  assert.equal(different.filter(r=>r.status===200).length,1);assert.equal(different.filter(r=>r.status===409).length,19);
  assert.equal((await post([{...parallel,projectKey:'mismatched-key'}])).status,403);
  const urlEvent={...parallel,id:randomUUID(),url:'https://example.invalid/reports?token=x#y',referrer:'https://example.invalid/?token=x#y'};
  assert.equal((await post([urlEvent])).status,200);
  const stored=await prisma.activationEvent.findUniqueOrThrow({where:{projectId_eventId:{projectId:project.id,eventId:urlEvent.id}}});
  assert.equal(stored.url,'https://example.invalid/reports');assert.equal(stored.referrer,'https://example.invalid/');
  const invalidCases: Array<[typeof events, number]> = [
    [[{ ...parallel, properties: { password: 'blocked' } }], 400],
    [[{ ...parallel, occurredAt: new Date(Date.now() + 2 * 86400000).toISOString() }], 400],
    [[{ ...parallel, properties: { goal: 'a'.repeat(501) } }], 400],
  ];
  for (const [items, status] of invalidCases) {
    const r = await post(items);
    assert.equal(r.status, status);
    assert.equal(r.headers.get('access-control-allow-origin'), 'http://127.0.0.1:3001');
  }
  const huge=await batch(request('/api/v1/events/batch',{padding:'x'.repeat(262145)},key.raw));assert.equal(huge.status,413);assert(huge.headers.get('access-control-allow-origin'));
  const tenant=await signup(request('/api/auth/signup',{email:'other@example.invalid',password:'local-fixture-only'}));const second=await tenant.json();
  const secondKey=await generateProjectKey('pk_live');await prisma.projectApiKey.create({data:{projectId:second.project.id,keyPrefix:secondKey.prefix,keyHash:secondKey.keyHash}});
  const r=await batch(request('/api/v1/events/batch',{events:[{...events[0],projectKey:secondKey.raw}]},secondKey.raw));assert.equal(r.status,200);
  assert.equal(await prisma.activationEvent.count({where:{eventId:events[0].id}}),2);
  await prisma.projectApiKey.update({where:{projectId_keyPrefix:{projectId:project.id,keyPrefix:key.prefix}},data:{revokedAt:new Date()}});
  const revoked=await post(events);assert.equal(revoked.status,401);assert(revoked.headers.get('access-control-allow-origin'));
  // Force the real key lookup dependency to throw, without a test-only API switch.
  const lookup = prisma.projectApiKey.findFirst;
  prisma.projectApiKey.findFirst = (async () => {
    throw new Error('Synthetic database failure');
  }) as unknown as typeof prisma.projectApiKey.findFirst;
  try {const failed=await post(events);assert.equal(failed.status,500);const b=await failed.json();assert(b.requestId);assert.equal(b.error,'ingest_failed');assert(failed.headers.get('access-control-allow-origin'));}
  finally {prisma.projectApiKey.findFirst=lookup;}
  console.log('PASS idempotency, conflicts, 20 concurrent identical/different posts, isolation, URL redaction, validation, revocation, JSON errors and CORS');

}
main().finally(() => prisma.$disconnect()).catch(e => { console.error(e); process.exitCode=1; });
