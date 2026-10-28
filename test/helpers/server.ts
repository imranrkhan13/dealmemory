// Direct handlers avoid dev compilation timing and exercise the actual route code.
import { NextRequest } from 'next/server';
export function request(path: string, body: unknown, key?: string) {
  return new NextRequest(`http://localhost:3000${path}`, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1:3001', ...(key ? { 'x-project-key': key } : {}) }, body: JSON.stringify(body) });
}
