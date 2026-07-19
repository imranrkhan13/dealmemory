export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { resetStore } from '@/lib/store'; import { ok } from '@/lib/api'; export async function POST() { return ok({ store: await resetStore() }); }
