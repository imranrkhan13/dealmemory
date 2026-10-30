import { getServerSession } from "next-auth";
import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().trim().email().max(254).transform((v) => v.toLowerCase()),
  name: z.string().max(80).optional(),
  password: z.string().min(8).refine((v) => Buffer.byteLength(v, "utf8") <= 72, "Password must be at most 72 UTF-8 bytes"),
});

export class UnauthorizedError extends Error {
  status = 401 as const;
  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  status = 403 as const;
  constructor(message = "You do not have access to this resource") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function getCurrentSession() {
  const { authOptions } = await import("@/lib/nextauth");
  return (await getServerSession(authOptions as any)) as any;
}

export async function getCurrentUser() {
  const { authOptions } = await import("@/lib/nextauth");
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return null;
  const { prisma } = await import("@/lib/db");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}

export async function requireAuth() {
  const { authOptions } = await import("@/lib/nextauth");
  const session = await getServerSession(authOptions as any);
  if (!(session as any)?.user) throw new UnauthorizedError();

  const { prisma } = await import("@/lib/db");
  let userId = (session as any)?.user?.id as string | undefined;
  if ((session as any)?.user?.email) {
    const found = await prisma.user.findUnique({
      where: { email: (session as any).user.email.trim().toLowerCase() },
      select: { id: true },
    });
    if (found?.id) userId = found.id;
  }
  if (!userId) throw new UnauthorizedError();
  return { session, userId };
}

export async function requireProjectAccess(projectId: string) {
  const { userId } = await requireAuth();
  const { prisma } = await import("@/lib/db");
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
    select: { id: true, ownerId: true, name: true, slug: true, createdAt: true },
  });
  if (!project) throw new ForbiddenError("Project not found or access denied");
  return { project, userId };
}