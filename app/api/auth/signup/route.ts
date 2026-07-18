import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db';
import { error } from '@/lib/api';
import { generateProjectKey } from '@/lib/keys';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(80).optional(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const body = schema.safeParse(await req.json());
  if (!body.success) return error(body.error.issues[0].message, 400);

  const { email, name, password } = body.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return error('User already exists', 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, name, passwordHash } });

  const baseName = name || email.split('@')[0] || 'My Project';
  const slugBase = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const slug = `${slugBase || 'project'}-${Math.random().toString(36).slice(2, 6)}`;

  const project = await prisma.project.create({
    data: {
      name: `${baseName}'s Project`,
      slug,
      ownerId: user.id,
    },
  });

  const pub = await generateProjectKey('pk_live');
  const sec = await generateProjectKey('sk_live');

  await prisma.projectApiKey.createMany({
    data: [
      { projectId: project.id, keyPrefix: pub.prefix, keyHash: pub.keyHash },
      { projectId: project.id, keyPrefix: sec.prefix, keyHash: sec.keyHash },
    ],
  });

  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name },
    project: { id: project.id, name: project.name, slug: project.slug },
  });

  // Set one-time onboarding keys cookie (HTTP-only, short-lived). Not stored in DB.
  res.cookies.set('dm_onboard', JSON.stringify({
    projectId: project.id,
    publicKey: pub.raw,
    secretKey: sec.raw,
  }), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  });

  return res;
}
