export function assertLocalDatabase(value = process.env.DATABASE_URL) {
  if (!value) throw new Error('DATABASE_URL is required: local dm_test* or dm_dev* database only');
  const url = new URL(value);
  const host = url.searchParams.get('host') || url.hostname;
  if (!['localhost', '127.0.0.1', '[::1]', '::1'].includes(host) && !host.startsWith('/')) throw new Error('Refusing non-local database');
  if (!/^dm_(test|dev)/.test(url.pathname.slice(1))) throw new Error('Refusing database without dm_test or dm_dev prefix');
  return value;
}
export async function resetDatabase() {
  assertLocalDatabase();
  const { prisma } = await import('../../lib/db');
  await prisma.$executeRawUnsafe('TRUNCATE "DodoWebhookEvent", "Subscription", "Session", "Account", "ActivationEvent", "TrialUser", "ProjectApiKey", "Project", "User", "VerificationToken" CASCADE');
}
