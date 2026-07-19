import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { prisma } from "@/lib/db";

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
  return (await getServerSession(authOptions as any)) as any;
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}

export async function requireAuth() {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) throw new UnauthorizedError();
  return { session, userId };
}

export async function requireProjectAccess(projectId: string) {
  const { userId } = await requireAuth();
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
    select: { id: true, ownerId: true, name: true, slug: true, createdAt: true },
  });
  if (!project) throw new ForbiddenError("Project not found or access denied");
  return { project, userId };
}