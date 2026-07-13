import { getStore, recommended } from '@/lib/store'; import { memoryConfigured } from '@/lib/memory'; import { ok } from '@/lib/api';
export async function GET() { const store = await getStore(); return ok({ ...store, recommended: recommended(store.user), providers: { memory: memoryConfigured(), checkout: Boolean(process.env.DODOPAYMENTSAPIKEY && process.env.DODOPRODUCTID) } }); }
