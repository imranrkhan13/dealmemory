import { createHash } from 'node:crypto';
import { MemoryItem } from './types';
export function memoryContainerTag(projectId:string, externalUserId:string) {
  return `p:${projectId}:u:${createHash('sha256').update(externalUserId).digest('hex').slice(0,16)}`;
}
export function memoryConfigured() { return Boolean(process.env.SUPERMEMORY_API_KEY); }
async function call(path:string, body:unknown, signal?:AbortSignal) {
  const response=await fetch(`${process.env.SUPERMEMORY_BASE_URL || 'https://api.supermemory.ai'}${path}`,{method:'POST',headers:{Authorization:`Bearer ${process.env.SUPERMEMORY_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(body),signal:signal ?? AbortSignal.timeout(3000)});
  if(!response.ok) throw new Error(`Memory provider failed (${response.status})`);
  return response.json();
}
export async function writeSupermemory(projectId:string, externalUserId:string, memory:MemoryItem, signal?:AbortSignal) {
  if(!memoryConfigured()) return {configured:false};
  await call('/v3/documents',{content:`Quoted data: ${JSON.stringify(memory.content.replace(/[\u0000-\u001f\u007f]/g,'').slice(0,500))}`,containerTag:memoryContainerTag(projectId,externalUserId),metadata:{category:memory.category,source:memory.source,createdAt:memory.createdAt}},signal);
  return {configured:true};
}
export async function retrieveSupermemory(projectId:string, externalUserId:string) {
  if(!memoryConfigured()) return {configured:false,results:[] as string[]};
  const data=await call('/v3/search',{q:'product progress goal behavior blocker',containerTags:[memoryContainerTag(projectId,externalUserId)],limit:8});
  return {configured:true,results:Array.isArray(data.results)?data.results:[]};
}
