# Fix notes

## Reproduction
`DATABASE_URL=postgresql://imran@127.0.0.1:55433/dm_test_core npm run test:integration` on the old implementation failed: `ingestion must persist the accepted events to Postgres`, `0 !== 3`. HTTP accepted 3 but Postgres stored none. Test calls real signup and ingest handlers directly, avoiding Next compilation latency. Key creation uses the real generator and database because authenticated handler tests need Next request/session context; full HTTP authentication is covered separately.

Read-only directory reproduction is not retained: permissions vary under privileged runners and would modify a shared tracked directory. The existing `writeFile` is sufficient evidence of filesystem dependence, not proof of the live failure. To confirm the live hypothesis, Imran should inspect Vercel function logs for the failing POST and EROFS/ENOENT involving `data/activation-events.json`. No live access performed.
