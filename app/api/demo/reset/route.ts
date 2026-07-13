import { resetStore } from '@/lib/store'; import { ok } from '@/lib/api'; export async function POST() { return ok({ store: await resetStore() }); }
