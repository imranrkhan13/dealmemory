import { spawnSync } from 'node:child_process';
export function assertLocalDatabase(value = process.env.DATABASE_URL) {
  if (!value) throw new Error('Set DATABASE_URL to a local dm_test* or dm_dev* database');
  const url = new URL(value);
  const host = url.searchParams.get('host') || url.hostname;
  if ((!['localhost','127.0.0.1','[::1]','::1'].includes(host) && !host.startsWith('/')) || !/^dm_(test|dev)/.test(url.pathname.slice(1))) throw new Error('Refusing non-local or non-throwaway database');
}
if (process.argv[1]?.endsWith('/local-db.mjs')) {
  assertLocalDatabase();
  const reset = process.argv.includes('--reset');
  const result = spawnSync('npx', ['prisma', 'migrate', ...(reset ? ['reset', '--force', '--skip-seed'] : ['deploy'])], {stdio:'inherit'});
  process.exit(result.status ?? 1);
}
