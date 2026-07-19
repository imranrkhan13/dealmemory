import { prisma } from '@/lib/db';

export type ResolvedProjectKey = {
  projectId: string;
  apiKeyId: string;
  keyPrefix: string;
};

async function randomId(len = 32) {
  const { randomUUID } = await import('node:crypto');
  return randomUUID().replaceAll('-', '').slice(0, len);
}

// Generate a raw key and its stored prefix/hash for pk_live or sk_live
export async function generateProjectKey(kind: 'pk_live' | 'sk_live') {
  const prefix = `${kind}_${await randomId(10)}`;
  const raw = `${prefix}_${await randomId(24)}`;
  const { hash } = await import('bcryptjs');
  const keyHash = await hash(raw, 10);
  return { prefix, raw, keyHash };
}

export async function resolveProjectByRawKey(rawKey: string): Promise<ResolvedProjectKey | null> {
  if (!rawKey || !rawKey.includes('_')) return null;
  const prefix = rawKey.split('_')[0];

  const apiKey = await prisma.projectApiKey.findFirst({
    where: { keyPrefix: prefix },
    select: { id: true, keyHash: true, projectId: true, revokedAt: true, keyPrefix: true },
  });

  if (!apiKey || apiKey.revokedAt) return null;

  const { compare } = await import('bcryptjs');
  const ok = await compare(rawKey, apiKey.keyHash);
  if (!ok) return null;

  return {
    projectId: apiKey.projectId,
    apiKeyId: apiKey.id,
    keyPrefix: apiKey.keyPrefix,
  };
}

export async function prefixesForProject(projectId: string): Promise<string[]> {
  if (!projectId) return [];
  const keys = await prisma.projectApiKey.findMany({
    where: { projectId, revokedAt: null },
    select: { keyPrefix: true },
  });
  return keys.map(k => k.keyPrefix);
}

export async function prefixesForUserProject(userId: string, projectId: string): Promise<string[]> {
  if (!userId || !projectId) return [];
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
    select: { id: true },
  });
  if (!project) return [];
  return prefixesForProject(projectId);
}

export function projectKeyHasAnyPrefix(projectKey: string, prefixes: string[]): boolean {
  if (!projectKey || !prefixes.length) return false;
  const pkPrefix = projectKey.split('_')[0];
  return prefixes.includes(pkPrefix);
}