# Baseline — 28 October 2026

HEAD: `2289dbb` (made it more perfect). Working tree initially clean. Branch: `fix/core-ingest`, from local main/origin main (same commit).

Commands and results:
- `git status --short`: empty.
- `git log --oneline -5`: 2289dbb, 81d54e2, 8ef2d82, ddda4ea, 2873925.
- `npm ci`: successful with approved network access; initial sandbox attempt failed (npm exit handler). npm reports 48 dependency vulnerabilities; remediation outside this functional baseline.
- `npm test`: all original 8 tests PASS, unchanged.
- `npm run typecheck`: exit 0.
- `npm run lint`: no ESLint warnings or errors.
- Docker daemon unavailable. Homebrew PostgreSQL 14 available. Initialized disposable `/tmp/dm-local-postgres`, bound to 127.0.0.1:55433, trust auth for local fictional data only.
- `createdb -h 127.0.0.1 -p 55433 dm_test_core`: exit 0.
- `DATABASE_URL=postgresql://imran@127.0.0.1:55433/dm_test_core npx prisma db push`: schema in sync, exit 0.
- `DATABASE_URL=postgresql://imran@127.0.0.1:55433/dm_test_core npm run build`: compiled, all 18 static pages generated, exit 0.
- `npm view agentlens name version description maintainers --json`: agentlens 1.0.0, description "test", maintainer dreuter. Read only; package not installed.
- PyPI JSON via `curl -fsS https://pypi.org/pypi/agentlens/json` and Python extraction: agentlens 0.1.44, "lightweight abstractions for building agent scaffolds", author danielreuter. Read only. This differs from audit version 0.1.30.

No live site/database access, credentials, publishing, deployment or account login performed.
