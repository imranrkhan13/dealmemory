import { MemoryItem } from './types';

function memoryBase() {
  // Resolve at call-time to avoid build-time env evaluation
  return process.env.SUPERMEMORY_BASE_URL || 'http://localhost:6767';
}

export function memoryConfigured() {
  // Gracefully report configuration without throwing during import
  return Boolean(process.env.SUPERMEMORY_API_KEY);
}

export async function writeSupermemory(userId: string, memory: MemoryItem) {
  if (!memoryConfigured()) return { configured: false as const };
  const apiKey = process.env.SUPERMEMORY_API_KEY;
  // Fail softly if missing at runtime
  if (!apiKey) return { configured: false as const };
  const response = await fetch(`${memoryBase()}/v3/documents`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: memory.content,
      containerTag: userId,
      metadata: {
        category: memory.category,
        source: memory.source,
        createdAt: memory.createdAt,
      },
    }),
  });
  if (!response.ok) throw new Error(`Supermemory request failed (${response.status}).`);
  return { configured: true as const };
}

export async function retrieveSupermemory(userId: string) {
  if (!memoryConfigured()) return { configured: false as const, results: [] as string[] };
  const apiKey = process.env.SUPERMEMORY_API_KEY;
  if (!apiKey) return { configured: false as const, results: [] as string[] };

  const response = await fetch(`${memoryBase()}/v3/search`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
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
`,
      containerTags: [userId],
      limit: 8,
    }),
  });

  if (!response.ok) {
    // Do not throw during build or runtime; return empty results gracefully
    return { configured: true as const, results: [] as string[] };
  }

  const data = await response.json().catch(() => ({ results: [] }));
  return { configured: true as const, results: Array.isArray(data.results) ? data.results : [] };
}