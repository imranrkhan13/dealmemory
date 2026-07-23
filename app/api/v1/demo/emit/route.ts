export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/db';
import { error } from '@/lib/api';
import { ingest } from '@/lib/intelligence';

const bodySchema = z.object({ projectId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) return error('Authentication required', 401);

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return error('projectId is required', 400);

  const project = await prisma.project.findFirst({
    where: { id: parsed.data.projectId, ownerId: session.user.id as string },
    select: {
      id: true,
      apiKeys: {
        where: { revokedAt: null, keyPrefix: { startsWith: 'pk_' } },
        orderBy: { createdAt: 'asc' },
        select: { keyPrefix: true },
        take: 1,
      },
    },
  });

  if (!project) return error('Project not found', 404);
  const keyPrefix = project.apiKeys[0]?.keyPrefix;
  if (!keyPrefix) return error('Create an active public key before running the demo', 409);

  const userId = `dm_demo_${project.id.slice(-8)}`;
  const anonymousId = `anon_${randomUUID()}`;
  const sessionId = `session_${randomUUID()}`;
  const start = Date.now() - 5_000;
  const event = (name: string, offset: number, properties: Record<string, string | number | boolean | null> = {}) => ({
    id: randomUUID(),
    // This route runs after ownership validation, so persisting the stored
    // prefix is sufficient for the same project-scoping code used by SDK data.
    projectKey: keyPrefix,
    name,
    userId,
    anonymousId,
    sessionId,
    occurredAt: new Date(start + offset).toISOString(),
    url: new URL('/demo', req.url).toString(),
    properties: { ...properties, demo: true },
  });

  const result = await ingest([
    event('trial_started', 0),
    event('goal_set', 1_000, { goal: 'Generate my first architecture map' }),
    event('repository_connection_failed', 2_000, { reason: 'OAuth callback failed' }),
    event('repository_connected', 3_000),
    event('first_map_generated', 4_000),
  ]);

  return NextResponse.json({ ok: true, userId, ...result });
}
