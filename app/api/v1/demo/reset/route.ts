export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/db';
import { error } from '@/lib/api';
import { events, save } from '@/lib/intelligence';
import { projectKeyHasAnyPrefix } from '@/lib/keys';

const bodySchema = z.object({ projectId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) return error('Authentication required', 401);

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return error('projectId is required', 400);

  const project = await prisma.project.findFirst({
    where: { id: parsed.data.projectId, ownerId: session.user.id as string },
    select: {
      apiKeys: {
        select: { keyPrefix: true },
      },
    },
  });
  if (!project) return error('Project not found', 404);

  const prefixes = project.apiKeys.map((key) => key.keyPrefix);
  const all = await events();
  const retained = all.filter((event) => {
    const isProjectDemo = projectKeyHasAnyPrefix(event.projectKey, prefixes) && event.properties?.demo === true;
    return !isProjectDemo;
  });
  await save(retained);

  return NextResponse.json({ ok: true, removed: all.length - retained.length });
}
