import { MemoryItem } from './types';

const base =
  process.env.SUPERMEMORY_BASE_URL || "http://localhost:6767";
export const memoryConfigured = () =>
  Boolean(process.env.SUPERMEMORY_API_KEY);
export async function writeSupermemory(userId: string, memory: MemoryItem) {
  if (!memoryConfigured()) return { configured: false as const };
  const response = await fetch(`${base}/v3/documents`, { method: 'POST', headers: { Authorization: `Bearer ${process.env.SUPERMEMORY_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ content: memory.content, containerTag: userId, metadata: { category: memory.category, source: memory.source, createdAt: memory.createdAt } }) });
  if (!response.ok) throw new Error(`Supermemory request failed (${response.status}).`);
  return { configured: true as const };
}
export async function retrieveSupermemory(userId: string) {
  if (!memoryConfigured()) return { configured: false as const, results: [] as string[] };
  const response = await fetch(`${base}/v3/search`, {
    method: 'POST', headers: { Authorization: `Bearer ${process.env.SUPERMEMORY_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({
      q: `
goal
behavior
blocker
progress
pricing
summary
upload
chat
export
subscription
churn
`, containerTags: [userId], limit: 8 }) });
  if (!response.ok) {
    console.error("Supermemory retrieval failed:", response.status);

    return {
      results: [],
    };
  }
  const data = await response.json();

  return {
    results: data.results ?? [],
  }; 
}
  