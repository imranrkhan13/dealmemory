# DealMemory Installation & Self-Hosting Guide

DealMemory is an open-source, privacy-first product memory and activation engine designed for SaaS products and AI agents. It reconstructs user journeys from client events, detects onboarding drop-offs, and provides contextual intelligence with zero external tracking bloat.

This guide provides step-by-step instructions for installing and running DealMemory locally or deploying it to production infrastructure.

---

## Table of Contents

1. [System Prerequisites](#1-system-prerequisites)
2. [Quickstart (Local Development)](#2-quickstart-local-development)
3. [Database Setup & Migrations](#3-database-setup--migrations)
4. [Environment Configuration Reference](#4-environment-configuration-reference)
5. [Running the Application](#5-running-the-application)
6. [Docker Deployment](#6-docker-deployment)
7. [Production Deployment](#7-production-deployment)
8. [Verifying Your Installation](#8-verifying-your-installation)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. System Prerequisites

Before installing DealMemory, ensure your host environment meets the following requirements:

- **Node.js**: Version `18.18.0` or higher (`node -v`)
- **Package Manager**: `npm` v9+ or `pnpm` v8+
- **Database**: PostgreSQL `14.0` or higher
- **Operating System**: macOS, Linux (Ubuntu 20.04+, Debian 11+), or Windows with WSL2

---

## 2. Quickstart (Local Development)

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/dealmemory.git
cd dealmemory
```

### Step 2: Install Node Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Copy the provided `.env.example` template:

```bash
cp .env.example .env
```

Generate a random 32-byte hexadecimal string for `NEXTAUTH_SECRET`:

```bash
openssl rand -hex 32
```

Edit your `.env` file and set the generated secret and your local PostgreSQL connection URL:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dealmemory?schema=public"
NEXTAUTH_SECRET="your-32-byte-hex-string-from-openssl"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 3. Database Setup & Migrations

DealMemory utilizes Prisma ORM with PostgreSQL.

### Option A: Local PostgreSQL Service

If you have PostgreSQL running locally:

```bash
# Create the database in psql
createdb dealmemory

# Apply Prisma schema and generate Prisma Client
npm run prisma:generate
npx prisma db push
```

Alternatively, to run tracked database migrations:

```bash
npx prisma migrate dev --name init
```

### Option B: Docker for PostgreSQL

If you do not have PostgreSQL installed locally, launch a throwaway container:

```bash
docker run --name dealmemory-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=dealmemory \
  -p 5432:5432 \
  -d postgres:16-alpine
```

Then initialize the schema:

```bash
npx prisma db push
```

---

## 4. Environment Configuration Reference

The following table details all configuration variables supported by DealMemory:

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string with `?schema=public`. |
| `NEXTAUTH_SECRET` | **Yes** in prod | — | 32+ character key used to encrypt session JWT tokens. |
| `NEXTAUTH_URL` | **Yes** | `http://localhost:3000` | Canonical root URL of your web application. |
| `NEXT_PUBLIC_APP_URL` | **Yes** | `http://localhost:3000` | Publicly reachable origin for customer redirect links. |
| `SDK_CORS_ORIGINS` | No | `""` | Comma-delimited list of external web origins allowed to stream telemetry events directly from client browsers. |
| `DODO_ENVIRONMENT` | No | `test_mode` | Billing mode for Dodo Payments (`test_mode` or `live_mode`). |
| `DODO_API_KEY` | No | — | Secret API key from Dodo Payments dashboard. |
| `DODO_WEBHOOK_SECRET` | No | — | Webhook signing secret used by `standardwebhooks` validator. |
| `DODO_PRODUCT_ID` | No | — | Subscription product ID for DealMemory Pro plans. |
| `DODO_PRICE_ID` | No | — | Optional price ID override for checkout sessions. |
| `SUPERMEMORY_API_KEY` | No | — | Optional API key for AI vector context graph integration. |
| `SUPERMEMORY_BASE_URL` | No | `https://api.supermemory.ai` | Custom base endpoint for Supermemory AI cluster. |

---

## 5. Running the Application

### Development Mode

Run the Next.js development server with hot reload:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- Access `/signup` to register your administrator account and primary workspace.
- Access `/settings` to obtain your public `pk_live_...` project key.
- Access `/overview` to explore the Supermemory-style operational console.

### Production Build

Build and start the optimized standalone production bundle:

```bash
npm run build
npm start
```

---

## 6. Docker Deployment

A containerized deployment can be set up using standard Docker commands:

```dockerfile
# Dockerfile
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

To build and execute:

```bash
docker build -t dealmemory:latest .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/dealmemory" \
  -e NEXTAUTH_SECRET="secret" \
  -e NEXTAUTH_URL="https://app.yourdomain.com" \
  dealmemory:latest
```

---

## 7. Production Deployment

### Deploying to Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Import your repository into the [Vercel Dashboard](https://vercel.com/new).
3. In **Settings > Environment Variables**, supply:
   - `DATABASE_URL` (Use a managed PostgreSQL provider such as Supabase, Neon, AWS RDS, or Render).
   - `NEXTAUTH_SECRET` (Generated via `openssl rand -hex 32`).
   - `NEXTAUTH_URL` (Your production domain, e.g. `https://memory.yourdomain.com`).
   - `NEXT_PUBLIC_APP_URL` (`https://memory.yourdomain.com`).
4. Set the build command to `npm run build` (which automatically executes `prisma generate && next build`).
5. Deploy.

---

## 8. Verifying Your Installation

DealMemory includes automated verification suites to validate database isolation, idempotency, and cryptographic integrity:

```bash
# 1. Typecheck and code standards
npm run typecheck
npm run lint

# 2. Run unit tests
npm test

# 3. Run database integration test suite
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dealmemory" npm run test:integration

# 4. Multi-tenant HTTP isolation verification
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dealmemory" npx tsx scripts/test-two-accounts.mjs
```

---

## 9. Troubleshooting

### `NEXTAUTH_SECRET is required in production`
- **Cause**: In production mode (`NODE_ENV=production`), NextAuth mandates a cryptographically secure secret.
- **Fix**: Set `NEXTAUTH_SECRET` to a 32+ character hex string in your `.env` or cloud hosting dashboard.

### `PrismaClientInitializationError: Can't reach database server`
- **Cause**: PostgreSQL service is stopped, port 5432 is blocked, or the connection string credentials are invalid.
- **Fix**: Verify PostgreSQL is accepting connections with `psql "$DATABASE_URL"` and confirm network routing.

### `CORS Error on /api/v1/events/batch`
- **Cause**: Browser telemetry is originating from a domain not present in `SDK_CORS_ORIGINS`.
- **Fix**: Add your client application domain (e.g. `https://app.example.com`) to `SDK_CORS_ORIGINS` in your server `.env`.
