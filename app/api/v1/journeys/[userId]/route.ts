export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/db';
import { blocker, inactiveHours, journeysForPrefixes, recommendation, state } from '@/lib/intelligence';
import { ok, error } from '@/lib/api';

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
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

    const all = await journeysForPrefixes(prefixes);
    const journey = all.find((j) => j.userId === params.userId);

    if (!journey) {
      return error('Journey not found', 404);
    }

    return ok({
      journey,
      state: state(journey),
      blocker: blocker(journey),
      recommendation: recommendation(journey),
      inactiveHours: inactiveHours(journey),
    });
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Failed to load journey', 500);
  }
}
