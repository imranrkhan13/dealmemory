import { prisma } from '@/lib/db';

export type ResolvedProjectKey = {
  projectId: string;
  apiKeyId: string;
  keyPrefix: string;
};

/**
 * Returns the stored, non-secret prefix of a project key.
 *
 * Current keys look like `pk_live_<id>_<secret>` (or `sk_live_…`). The
 * earliest project endpoint issued `pk_<id>_<secret>` keys, so we keep that
 * format working as well. Splitting at the first underscore is not enough:
 * it turns every `pk_live` key into `pk` and makes a valid key impossible to
 * resolve or use for project-scoped reads.
 */
export function projectKeyPrefix(rawKey: string): string | null {
  const parts = rawKey.split('_');
  if (parts.length < 3 || (parts[0] !== 'pk' && parts[0] !== 'sk')) return null;

  if ((parts[1] === 'live' || parts[1] === 'test') && parts.length >= 3) {
    return parts.slice(0, 3).join('_');
  }

  // Legacy format: pk_<prefix>_<secret>
  return parts.slice(0, 2).join('_');
}

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
  const prefix = projectKeyPrefix(rawKey);
  if (!prefix) return null;

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
  const prefix = projectKeyPrefix(projectKey);
  return Boolean(prefix && prefixes.includes(prefix));
}
