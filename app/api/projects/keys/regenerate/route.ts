export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/db';
import { error } from '@/lib/api';
import { generateProjectKey } from '@/lib/keys';

type Body = {
  projectId: string;
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

  const { projectId } = body || ({} as Body);
  if (!projectId) return error('projectId is required', 400);

  const owned = await prisma.project.findFirst({
    where: { id: projectId, ownerId: session.user.id as string },
    select: { id: true },
  });
  if (!owned) return error('Forbidden', 403);

  // Revoke all existing active secret keys for this project
  await prisma.projectApiKey.updateMany({
    where: {
      projectId,
      revokedAt: null,
      keyPrefix: { startsWith: 'sk_live' },
    },
    data: { revokedAt: new Date() },
  });

  // Create new secret
  const sec = await generateProjectKey('sk_live');
  await prisma.projectApiKey.create({
    data: { projectId, keyPrefix: sec.prefix, keyHash: sec.keyHash },
  });

  return NextResponse.json({
    ok: true,
    prefix: sec.prefix,
    raw: sec.raw, // one-time return so UI can show once
  });
}