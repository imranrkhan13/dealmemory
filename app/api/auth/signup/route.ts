import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db';
import { error, ok } from '@/lib/api';

const schema = z.object({ email: z.string().email(), name: z.string().min(1).max(80).optional(), password: z.string().min(8) });

export async function POST(req: NextRequest) {
  const body = schema.safeParse(await req.json());
  if (!body.success) return error(body.error.issues[0].message, 400);
  const { email, name, password } = body.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return error('User already exists', 409);
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, name, passwordHash } });
  return ok({ user: { id: user.id, email: user.email, name: user.name } });
}
