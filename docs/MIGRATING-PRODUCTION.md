# Production migration — run only after Imran approves

Do not run these from an agent session. No production migration was executed.

1. Stop writes during migration. Back up production with `pg_dump --format=custom "$DATABASE_URL" > backup.dump` and verify the backup is restorable.
2. Run `psql "$DATABASE_URL" -f docs/sql/check-duplicate-key-prefixes.sql`. It must return zero rows. If there are duplicates, STOP and resolve ownership explicitly before proceeding. Do not delete keys blindly.
3. Compare the existing schema to `20261028000000_baseline/migration.sql`, including Subscription. Reconcile drift with a reviewed plan before continuing.
4. For an existing database created by db push only: `npx prisma migrate resolve --applied 20261028000000_baseline`.
5. `npx prisma migrate deploy` applies the additive durable-events migration. Do not resolve the second migration as applied.
6. `npx prisma generate`. Deploy application only after schema changes succeed; keep the backup and run tenant-isolation smoke checks.

For a fresh empty database, use `prisma migrate deploy` directly: do not resolve the baseline. Local scripts reject remote databases and database names without dm_test/dm_dev prefixes. Production steps are deliberately manual.
