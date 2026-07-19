export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/db';
import { events } from '@/lib/intelligence';
import { ok, error } from '@/lib/api';

export async function GET(req: NextRequest) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) return error('Authentication required', 401);

  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId') ?? undefined;

  let prefixes: string[] = [];

  if (projectId) {
    const owned = await prisma.project.findFirst({
      where: { id: projectId, ownerId: session.user.id as string },
      select: { id: true },
    });
    if (!owned) return error('Forbidden', 403);
    const keys = await prisma.projectApiKey.findMany({
      where: { projectId, revokedAt: null },
      select: { keyPrefix: true },
    });
    prefixes = keys.map((k) => k.keyPrefix);
  } else {
    const keys = await prisma.projectApiKey.findMany({
      where: { project: { ownerId: session.user.id as string }, revokedAt: null },
      select: { keyPrefix: true },
    });
    prefixes = keys.map((k) => k.keyPrefix);
  }

  const list = (await events())
    .filter((e) => {
      const prefix = (e.projectKey ?? '').split('_')[0];
      return prefixes.includes(prefix);
    })
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, 20);

  return ok({ events: list });
}
