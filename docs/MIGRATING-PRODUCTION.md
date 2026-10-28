# Production Migration Guide — Run Only After Imran Approves

> **CRITICAL GATE**: Do NOT run these commands from an automated agent session. No production migration has been executed. Every step below must be manually approved and executed by the project owner.

---

## Pre-flight Checklist

- [ ] Imran's explicit written approval received.
- [ ] Temporary maintenance window scheduled and active writes halted.
- [ ] Dedicated empty scratch database provisioned for shadow schema and restore testing (NEVER use production as shadow).
- [ ] Production database connection string exported as `$DATABASE_URL`.
- [ ] Dedicated scratch shadow database connection string exported as `$SHADOW_URL`.

---

## Step 1: Pre-migration Backup & Restore Verification

1. **Create custom-format dump:**
   ```bash
   pg_dump --format=custom "$DATABASE_URL" > "prod_backup_$(date +%Y%m%d_%H%M%S).dump"
   ```

2. **Verify backup restorable into a scratch database:**
   ```bash
   # Restore dump into an empty scratch database (NOT production)
   pg_restore --clean --if-exists -d "$SCRATCH_RESTORE_URL" "prod_backup_$(date +%Y%m%d_%H%M%S).dump"
   ```

3. **Verify row count parity across all tables:**
   Run the following query against BOTH `$DATABASE_URL` and `$SCRATCH_RESTORE_URL`:
   ```sql
   SELECT 'User' as tbl, count(*) FROM "User"
   UNION ALL SELECT 'Project', count(*) FROM "Project"
   UNION ALL SELECT 'ProjectApiKey', count(*) FROM "ProjectApiKey"
   UNION ALL SELECT 'TrialUser', count(*) FROM "TrialUser"
   UNION ALL SELECT 'ActivationEvent', count(*) FROM "ActivationEvent"
   UNION ALL SELECT 'Session', count(*) FROM "Session"
   UNION ALL SELECT 'Account', count(*) FROM "Account"
   UNION ALL SELECT 'Subscription', count(*) FROM "Subscription"
   UNION ALL SELECT 'DodoWebhookEvent', count(*) FROM "DodoWebhookEvent"
   UNION ALL SELECT 'VerificationToken', count(*) FROM "VerificationToken"
   ORDER BY tbl;
   ```
   *The row counts on each table must match exactly. If counts diverge, stop immediately and investigate.*

---

## Step 2: Duplicate keyPrefix Check

The `durable_events` migration introduces a global unique index `ProjectApiKey_keyPrefix_key` on `"ProjectApiKey"("keyPrefix")`.

1. **Run duplicate prefix inspection:**
   ```bash
   psql "$DATABASE_URL" -f docs/sql/check-duplicate-key-prefixes.sql
   ```
   The query checks for duplicates:
   ```sql
   SELECT "keyPrefix", count(*) FROM "ProjectApiKey" GROUP BY "keyPrefix" HAVING count(*) > 1;
   ```

2. **Evaluation:**
   - **Zero rows:** Safe to proceed.
   - **One or more rows:** **STOP IMMEDIATELY.** Do NOT delete or mutate keys blindly.
     - Inspect the duplicate rows and identify the projects and owners.
     - Coordinate with the owners to determine which key is active and revoke or replace conflicting keys manually before proceeding.

---

## Step 3: Two-Step Drift & Change Inspection

A diff against ALL migrations will include the expected `durable_events` changes (new columns, unique index), so a non-empty result alone does not indicate schema drift. Drift must be validated in two separate steps:

### Step 3a: Verify Existing Database Matches Baseline Only

1. **Prepare baseline-only migrations directory:**
   ```bash
   BASELINE_ONLY_DIR="$(mktemp -d)"
   cp -r prisma/migrations/20261028000000_baseline "$BASELINE_ONLY_DIR/"
   cp prisma/migrations/migration_lock.toml "$BASELINE_ONLY_DIR/"
   ```

2. **Diff production database against baseline target:**
   ```bash
   npx prisma migrate diff \
     --from-url "$DATABASE_URL" \
     --to-migrations "$BASELINE_ONLY_DIR" \
     --shadow-database-url "$SHADOW_URL" \
     --script \
     --exit-code
   ```
   - **Exit code 0 (`-- This is an empty migration.`):** Production schema matches the baseline perfectly. Proceed to Step 3b.
   - **Exit code 2 (non-empty SQL):** **REAL DRIFT DETECTED.** Stop and review the output SQL. Reconcile differences before applying new migrations.

### Step 3b: Inspect the Intended Additive Change

Inspect the exact SQL delta that `durable_events` introduces:
```bash
npx prisma migrate diff \
  --from-migrations "$BASELINE_ONLY_DIR" \
  --to-migrations prisma/migrations \
  --shadow-database-url "$SHADOW_URL" \
  --script
```
Verify that the output contains **only** the additive changes:
- `ALTER TABLE "ActivationEvent" ADD COLUMN "anonymousId" TEXT, ADD COLUMN "payloadHash" TEXT, ADD COLUMN "referrer" TEXT, ADD COLUMN "url" TEXT;`
- Indexes on `ActivationEvent`: `("projectId", "name")`, `("projectId", "occurredAt")`, `("projectId", "trialUserId", "occurredAt")`.
- Unique index: `CREATE UNIQUE INDEX "ProjectApiKey_keyPrefix_key" ON "ProjectApiKey"("keyPrefix");`.

Clean up temporary directory:
```bash
rm -rf "$BASELINE_ONLY_DIR"
```

---

## Step 4: Baseline Resolve (db push Databases Only)

- **For an existing database initially provisioned via `prisma db push`:**
  Prisma Migrate requires the baseline migration recorded in `_prisma_migrations` as applied:
  ```bash
  npx prisma migrate resolve --applied 20261028000000_baseline
  ```
- **When NOT to run this:**
  Do **NOT** run this command on a fresh or empty database. A fresh database must apply the baseline cleanly using `prisma migrate deploy`.

---

## Step 5: Execute Migration & Client Generation

1. **Apply the durable_events migration:**
   ```bash
   npx prisma migrate deploy
   ```
   *(Do NOT manually resolve the durable_events migration as applied.)*

2. **Re-generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Deploy application code and restart services.**

---

## Step 6: Post-migration Verification & Isolation Smoke Test

1. **Verify tenant isolation:**
   - Sign in with test accounts and query `/api/v1/events/recent?projectId=<id>` and `/api/v1/journeys?projectId=<id>`.
   - Verify accounts cannot read projects they do not own (HTTP 403 Forbidden).
2. **Verify public key ingestion:**
   - Send a test event batch to `/api/v1/events/batch` with a valid key.
   - Confirm deduplication (`deduplicated: 1` on replay with identical payload).
   - Confirm conflict rejection (`409` on payload reuse with different contents).
   - Confirm key with invalid secret returns `401`.

---

## Step 7: Rollback Procedure

### If `durable_events` Fails Partway During `migrate deploy`:
Prisma executes migration SQL within a transaction. If a failure occurs (e.g. duplicate keyPrefix detected):
1. The transaction will automatically roll back in Postgres, leaving existing tables untouched.
2. Mark the migration as rolled back in Prisma migration tracking:
   ```bash
   npx prisma migrate resolve --rolled-back 20261028000100_durable_events
   ```
3. Resolve the underlying blocker (e.g. resolve conflicting key prefixes).

### Full Database Rollback from Dump:
If unexpected issues arise after deployment:
1. Put application into maintenance mode to halt incoming writes.
2. Restore the pre-migration dump to production:
   ```bash
   pg_restore --clean --if-exists -d "$DATABASE_URL" "prod_backup_<TIMESTAMP>.dump"
   ```
3. Re-verify row counts using the table count query in Step 1.
4. Verify tenant isolation with a smoke check.
5. Re-enable traffic and monitor application logs.
