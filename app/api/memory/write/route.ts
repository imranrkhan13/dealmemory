import { z } from 'zod';
import { writeSupermemory } from '@/lib/memory';
import { error, ok } from '@/lib/api';
import { requireAuth } from '@/lib/auth';

const schema = z.object({
  category: z.enum(['goal','setupstate','blocker','progress','objection','purchasecontext']),
  content: z.string().min(2),
  source: z.enum(['usermessage','productevent']).default('usermessage'),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return error(parsed.error.issues[0].message);

  try {
    const { userId } = await requireAuth();
    const provider = await writeSupermemory(userId, {
      category: parsed.data.category,
      content: parsed.data.content,
      source: parsed.data.source,
      createdAt: new Date().toISOString(),
    });
    return ok({ provider });
  } catch (e: any) {
    if (e?.status === 401) return error('Authentication required', 401);
    return error(e instanceof Error ? e.message : 'Memory write failed.', 502);
  }
}
