export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { error, ok } from '@/lib/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { NextResponse } from 'next/server';

const bodySchema = z.object({ name: z.string().min(2).max(80) });

export async function POST(req: Request) {
	const session = (await getServerSession(authOptions as any)) as any;
	if (!session?.user?.email) return error('Authentication required', 401);

	const body = bodySchema.safeParse(await req.json());
	if (!body.success) return error(body.error.issues[0].message, 400);
	const user = await prisma.user.findUnique({ where: { email: session.user.email } });
	if (!user) return error('Authenticated user not found', 401);

	const slugBase = body.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
	const slug = `${slugBase || 'project'}-${Math.random().toString(36).slice(2, 8)}`;

	const project = await prisma.project.create({
		data: {
			name: body.data.name,
			slug,
			ownerId: user.id,
		},
		include: { apiKeys: true },
	});

	return ok({ project: { id: project.id, name: project.name, slug: project.slug } });
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

    projects = [created];
  }

  return ok({ projects });
}
