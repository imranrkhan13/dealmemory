import { z } from 'zod';
import { prisma } from '@/lib/db';
import { error, ok } from '@/lib/api';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
	const key = new URL(req.url).searchParams.get('key');
	if (!key) return error('Project key is required.');

	// find by prefix
	const prefix = key.split('_')[0];
	const apiKey = await prisma.projectApiKey.findFirst({ where: { keyPrefix: prefix }, include: { project: true } });
	if (!apiKey) return error('Unknown project key.', 404);
	return ok({ project: { id: apiKey.project.id, name: apiKey.project.name, slug: apiKey.project.slug } });
}
