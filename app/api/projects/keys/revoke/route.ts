export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/db';
import { error } from '@/lib/api';

type Body = {
  projectId: string;
  prefix: string;
};

export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) return error('Authentication required', 401);

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return error('Invalid JSON body', 400);
  }

  const { projectId, prefix } = body || ({} as Body);
  if (!projectId || !prefix) return error('projectId and prefix are required', 400);

  // Ensure ownership
  const owned = await prisma.project.findFirst({
    where: { id: projectId, ownerId: session.user.id as string },
    select: { id: true },
  });
  if (!owned) return error('Forbidden', 403);

  // Revoke key by prefix
  const existing = await prisma.projectApiKey.findFirst({
    where: { projectId, keyPrefix: prefix, revokedAt: null },
    select: { id: true },
  });
  if (!existing) {
    // Already revoked or not found -> idempotent OK
    return NextResponse.json({ ok: true, revoked: false });
  }

  await prisma.projectApiKey.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ ok: true, revoked: true });
}