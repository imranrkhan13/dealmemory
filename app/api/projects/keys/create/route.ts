import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { error } from '@/lib/api';
import { generateProjectKey } from '@/lib/keys';

type Body = {
  projectId: string;
  kind: 'pk_live' | 'sk_live';
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

  const { projectId, kind } = body || ({} as Body);
  if (!projectId || (kind !== 'pk_live' && kind !== 'sk_live')) {
    return error('projectId and kind (pk_live|sk_live) are required', 400);
  }

  const owned = await prisma.project.findFirst({
    where: { id: projectId, ownerId: session.user.id as string },
    select: { id: true },
  });
  if (!owned) return error('Forbidden', 403);

  const key = await generateProjectKey(kind);
  await prisma.projectApiKey.create({
    data: { projectId, keyPrefix: key.prefix, keyHash: key.keyHash },
  });

  return NextResponse.json({
    ok: true,
    prefix: key.prefix,
    raw: key.raw, // one-time return; client must not store server-side
  });
}