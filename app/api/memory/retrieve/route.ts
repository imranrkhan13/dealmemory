export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { retrieveSupermemory } from '@/lib/memory';
import { error, ok } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

export async function POST() {
  try {
    const { userId } = await requireAuth();
    const provider = await retrieveSupermemory(userId);
    return ok({ provider, results: provider?.results ?? [] });
  } catch (e) {
    if (e instanceof Error && (e as any).status === 401) {
      return error('Authentication required', 401);
    }
    return error(e instanceof Error ? e.message : 'Memory retrieval failed.', 502);
  }
}
