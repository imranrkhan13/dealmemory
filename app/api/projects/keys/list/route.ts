export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/db';
import { error } from '@/lib/api';

function inferType(prefix: string): 'public' | 'secret' {
  if (prefix.startsWith('pk_live')) return 'public';
  if (prefix.startsWith('sk_live')) return 'secret';
  return 'secret';
}

export async function GET(req: NextRequest) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) return error('Authentication required', 401);

  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId') ?? undefined;

  if (!projectId) return error('projectId is required', 400);

  const owned = await prisma.project.findFirst({
    where: { id: projectId, ownerId: session.user.id as string },
    select: { id: true },
  });
  if (!owned) return error('Forbidden', 403);

  const keys = await prisma.projectApiKey.findMany({
    where: { projectId, },
    select: { keyPrefix: true, createdAt: true, revokedAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    ok: true,
    keys: keys.map(k => ({
      prefix: k.keyPrefix,
      type: inferType(k.keyPrefix),
      createdAt: k.createdAt,
      revokedAt: k.revokedAt ?? null,
      masked: k.keyPrefix + '_••••••••••••••••',
    })),
  });
}