import { MemoryItem } from './types';

const base = 'https://api.supermemory.ai';
export const memoryConfigured = () => Boolean(process.env.SUPERMEMORYAPIKEY);
export async function writeSupermemory(userId: string, memory: MemoryItem) {
  if (!memoryConfigured()) return { configured: false as const };
  const response = await fetch(`${base}/v3/documents`, { method: 'POST', headers: { Authorization: `Bearer ${process.env.SUPERMEMORYAPIKEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ content: memory.content, containerTag: userId, metadata: { category: memory.category, source: memory.source, createdAt: memory.createdAt } }) });
  if (!response.ok) throw new Error(`Supermemory request failed (${response.status}).`);
  return { configured: true as const };
}
export async function retrieveSupermemory(userId: string) {
  if (!memoryConfigured()) return { configured: false as const, results: [] as string[] };
  const response = await fetch(`${base}/v3/search`, { method: 'POST', headers: { Authorization: `Bearer ${process.env.SUPERMEMORYAPIKEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ q: 'trial user goal setup blocker progress', containerTags: [userId], limit: 8 }) });
  if (!response.ok) throw new Error(`Supermemory retrieval failed (${response.status}).`);
  const data = await response.json() as { results?: Array<{ content?: string }> }; return { configured: true as const, results: (data.results ?? []).map(x => x.content ?? '').filter(Boolean) };
}
