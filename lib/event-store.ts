import { createHash } from 'node:crypto';
import type { ActivationEvent as Row, TrialUser } from '@prisma/client';
import { prisma } from './db';
import type { ActivationEvent } from '@/packages/shared/src/events';
import { memoryConfigured, writeSupermemory } from './memory';

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value).filter(([,v])=>v!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  return JSON.stringify(value);
}
export function payloadHash(event: ActivationEvent) {
  const {name,userId,anonymousId,sessionId,occurredAt,url,referrer,properties} = event;
  return createHash('sha256').update(canonical({name,userId,anonymousId,sessionId,occurredAt,url,referrer,properties})).digest('hex');
}
export function cleanUrl(value?: string) {
  if (!value) return undefined;
  try { const url = new URL(value); url.search=''; url.hash=''; return url.toString(); } catch { return undefined; }
}
export function safeParseProps(props?: string | null): Record<string, string | number | boolean | null> {
  if (!props) return {};
  try {
    const parsed = JSON.parse(props);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, string | number | boolean | null>) : {};
  } catch {
    return {};
  }
}
export function mapEvent(row: Row & {trialUser?: TrialUser | null}): ActivationEvent {
  const externalUserId = row.trialUser?.externalUserId ?? row.anonymousId ?? 'unknown';
  const isAnon = externalUserId.startsWith('anon:');
  const occurredAtStr =
    row.occurredAt instanceof Date
      ? row.occurredAt.toISOString()
      : isNaN(new Date(row.occurredAt).getTime())
      ? new Date().toISOString()
      : new Date(row.occurredAt).toISOString();

  return {
    id: row.eventId,
    projectKey: '',
    name: row.name,
    userId: isAnon ? undefined : externalUserId,
    anonymousId: row.anonymousId ?? externalUserId.replace(/^anon:/, ''),
    sessionId: row.sessionId,
    occurredAt: occurredAtStr,
    url: row.url ?? undefined,
    referrer: row.referrer ?? undefined,
    properties: safeParseProps(row.properties),
  };
}
export async function events(projectId: string) {
  if (!projectId) return [];
  return (await prisma.activationEvent.findMany({where:{projectId}, include:{trialUser:true}, orderBy:[{occurredAt:'asc'},{id:'asc'}]})).map(mapEvent);
}
export async function ingest(projectId: string, items: ActivationEvent[]) {
  const result = await prisma.$transaction(async tx => {
    const fresh: ActivationEvent[] = [];
    const conflicts: {index:number;eventId:string;reason:string}[] = [];
    let deduplicated=0;
    for (let index=0; index<items.length; index++) {
      const event=items[index];
      const externalUserId=event.userId ?? `anon:${event.anonymousId}`;
      // ON CONFLICT is the arbiter for concurrent users and concurrent event IDs.
      await tx.trialUser.createMany({data:[{projectId,externalUserId}],skipDuplicates:true});
      const user=await tx.trialUser.findUniqueOrThrow({where:{projectId_externalUserId:{projectId,externalUserId}}});
      const hash=payloadHash(event);
      const inserted=await tx.activationEvent.createMany({data:[{projectId,eventId:event.id,trialUserId:user.id,sessionId:event.sessionId,name:event.name,properties:JSON.stringify(event.properties),occurredAt:new Date(event.occurredAt),anonymousId:event.anonymousId,url:cleanUrl(event.url),referrer:cleanUrl(event.referrer),payloadHash:hash}],skipDuplicates:true});
      if (inserted.count) {
        if (event.name === 'identified' || event.properties?.email || event.properties?.company || event.properties?.role || event.properties?.goal) {
          try {
            let existingTraits: Record<string, unknown> = {};
            if (user.attributes) { try { existingTraits = JSON.parse(user.attributes); } catch {} }
            const merged = { ...existingTraits, ...event.properties };
            const emailCandidate = typeof event.properties?.email === 'string' ? event.properties.email : user.email;
            await tx.trialUser.update({
              where: { id: user.id },
              data: { attributes: JSON.stringify(merged), ...(emailCandidate ? { email: emailCandidate } : {}) },
            });
          } catch {}
        }
        fresh.push(event);
        continue;
      }
      const previous=await tx.activationEvent.findUniqueOrThrow({where:{projectId_eventId:{projectId,eventId:event.id}},include:{trialUser:true}});
      const same=previous.payloadHash ? previous.payloadHash===hash : previous.name===event.name && previous.occurredAt.getTime()===new Date(event.occurredAt).getTime() && previous.trialUser.externalUserId===externalUserId;
      if (same) deduplicated++;
      else conflicts.push({index,eventId:event.id,reason:'event_id_reused_with_different_payload'});
    }
    return {fresh,deduplicated,conflicts};
  }, {maxWait:15000,timeout:15000});
  const memory: {event:string;success:boolean;error?:string}[]=[];
  if (memoryConfigured() && result.fresh.length) {
    const signal=AbortSignal.timeout(3000);
    const queue=[...result.fresh];
    await Promise.all(Array.from({length:Math.min(4,queue.length)},async()=>{
      while(queue.length && !signal.aborted) {
        const event=queue.shift()!;
        try {
          await writeSupermemory(projectId,event.userId ?? `anon:${event.anonymousId}`,{category:'progress',content:`Product event: ${event.name}. Quoted property data: ${JSON.stringify(event.properties).replace(/[\u0000-\u001f\u007f]/g,'').slice(0,200)}`,source:'productevent',createdAt:event.occurredAt},signal);
          memory.push({event:event.id,success:true});
        } catch { console.warn('Optional memory write failed'); memory.push({event:event.id,success:false,error:'memory_write_failed'}); }
      }
    }));
    memory.push(...queue.map(event=>({event:event.id,success:false,error:'memory_deadline_exceeded'})));
  }
  return {accepted:result.fresh.length,deduplicated:result.deduplicated,conflicts:result.conflicts,rejected:[],memory};
}
