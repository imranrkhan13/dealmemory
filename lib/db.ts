import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

globalForPrisma.prisma = prisma;

let schemaInitialized = false;
let schemaPromise: Promise<void> | null = null;

export async function ensureDatabaseSchema() {
  if (schemaInitialized) return;
  if (!schemaPromise) {
    schemaPromise = (async () => {
      try {
        const statements = [
          'ALTER TABLE "ActivationEvent" ADD COLUMN IF NOT EXISTS "anonymousId" TEXT',
          'ALTER TABLE "ActivationEvent" ADD COLUMN IF NOT EXISTS "url" TEXT',
          'ALTER TABLE "ActivationEvent" ADD COLUMN IF NOT EXISTS "referrer" TEXT',
          'ALTER TABLE "ActivationEvent" ADD COLUMN IF NOT EXISTS "payloadHash" TEXT',
          'ALTER TABLE "ActivationEvent" ADD COLUMN IF NOT EXISTS "isValid" BOOLEAN DEFAULT true',
          'ALTER TABLE "ActivationEvent" ADD COLUMN IF NOT EXISTS "invalidReason" TEXT',
          'ALTER TABLE "TrialUser" ADD COLUMN IF NOT EXISTS "attributes" TEXT',
          'ALTER TABLE "TrialUser" ADD COLUMN IF NOT EXISTS "email" TEXT',
        ];
        for (const sql of statements) {
          try {
            await prisma.$executeRawUnsafe(sql);
          } catch {}
        }
        schemaInitialized = true;
      } catch (err) {
        console.warn('[ensureDatabaseSchema] non-critical schema check:', err);
      }
    })();
  }
  return schemaPromise;
}

