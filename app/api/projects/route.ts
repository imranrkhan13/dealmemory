import { z } from 'zod';
import { prisma } from '@/lib/db';
import { error, ok } from '@/lib/api';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

const bodySchema = z.object({ name: z.string().min(2).max(80) });

export async function POST(req: Request) {
	const session = (await getServerSession(authOptions as any)) as any;
	if (!session?.user?.email) return error('Authentication required', 401);

	const body = bodySchema.safeParse(await req.json());
	if (!body.success) return error(body.error.issues[0].message, 400);
	const user = await prisma.user.findUnique({ where: { email: session.user.email } });
	if (!user) return error('Authenticated user not found', 401);

	// create project and a single test API key, returning the raw key once
	const prefix = `pk_${crypto.randomUUID().replaceAll('-', '').slice(0,10)}`;
	const rawKey = `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;
	const keyHash = await bcrypt.hash(rawKey, 10);

	const project = await prisma.project.create({
		data: {
			name: body.data.name,
			slug: body.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
			ownerId: user.id,
			apiKeys: { create: { keyPrefix: prefix, keyHash } },
		},
		include: { apiKeys: true },
	});

	return ok({ project: { id: project.id, name: project.name, slug: project.slug }, rawKey });
}

export async function GET(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.id) return error('Authentication required', 401);

  // Fetch user to build a friendly default project name if needed
  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { id: true, name: true, email: true },
  });

  let projects = await prisma.project.findMany({
    where: { ownerId: session.user.id as string },
    select: { id: true, name: true, slug: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  // If legacy/no projects, bootstrap a default project with initial keys
  if (projects.length === 0) {
    const baseName = user?.name || (user?.email ? user.email.split('@')[0] : 'My Project');
    const slugBase = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${slugBase || 'project'}-${Math.random().toString(36).slice(2, 6)}`;

    const created = await prisma.project.create({
      data: {
        name: `${baseName}'s Project`,
        slug,
        ownerId: session.user.id as string,
      },
      select: { id: true, name: true, slug: true, createdAt: true },
    });

    // Generate initial public and secret keys
    const { generateProjectKey } = await import('@/lib/keys');
    const pub = await generateProjectKey('pk_live');
    const sec = await generateProjectKey('sk_live');

    await prisma.projectApiKey.createMany({
      data: [
        { projectId: created.id, keyPrefix: pub.prefix, keyHash: pub.keyHash },
        { projectId: created.id, keyPrefix: sec.prefix, keyHash: sec.keyHash },
      ],
    });

    projects = [created];

    // Manually create response to attach one-time onboarding cookie
    const res = NextResponse.json({ ok: true, projects });
    res.cookies.set(
      'dm_onboard',
      JSON.stringify({ projectId: created.id, publicKey: pub.raw, secretKey: sec.raw }),
      { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 600 }
    );
    return res;
  }

  return ok({ projects });
}
