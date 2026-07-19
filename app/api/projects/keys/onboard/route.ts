export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/db';
import { error } from '@/lib/api';

export async function GET(req: NextRequest) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) return error('Authentication required', 401);

  const cookie = req.cookies.get('dm_onboard')?.value;
  if (!cookie) {
    return NextResponse.json({ ok: true, onboard: null });
  }

  let data: { projectId: string; publicKey?: string; secretKey?: string } | null = null;
  try {
    data = JSON.parse(cookie);
  } catch {
    data = null;
  }
  if (!data?.projectId) {
    const res = NextResponse.json({ ok: true, onboard: null });
    // clear invalid cookie
    res.cookies.set('dm_onboard', '', { path: '/', maxAge: 0 });
    return res;
  }

  const owned = await prisma.project.findFirst({
    where: { id: data.projectId, ownerId: session.user.id as string },
    select: { id: true },
  });
  if (!owned) {
    const res = error('Forbidden', 403);
    (res as any).cookies?.set?.('dm_onboard', '', { path: '/', maxAge: 0 });
    return res;
  }

  const res = NextResponse.json({
    ok: true,
    onboard: {
      projectId: data.projectId,
      publicKey: data.publicKey ?? null,
      secretKey: data.secretKey ?? null,
    },
  });

  // one-time read: clear cookie so secrets aren't re-readable
  res.cookies.set('dm_onboard', '', { path: '/', maxAge: 0 });

  return res;
}