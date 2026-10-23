# DairyOS Enterprise Dairy ERP

DairyOS is a React and TypeScript dairy ERP prototype with an Express API and Prisma persistence. It contains 20 management screens covering collection, quality, chilling, processing, herd and farmer records, inventory, sales, payments, reporting, AI and administration. The current implementation mixes server-backed workflows with local sample data. It is not yet production-ready; see the [R0 repository audit](docs/modernization/REPOSITORY_AUDIT.md) for evidence and known blockers.

## Repository and planning

- [Architecture graph](docs/modernization/ARCHITECTURE_GRAPH.md)
- [Feature matrix for all 20 screens and future clients](docs/modernization/FEATURE_MATRIX.md)
- [Security and data integrity findings](docs/modernization/SECURITY_AND_DATA_INTEGRITY.md)
- [UI/UX blueprint](docs/modernization/UI_UX_BLUEPRINT.md)
- [Incremental release roadmap](docs/modernization/IMPLEMENTATION_ROADMAP.md)
- [Emergency demo runbook](docs/modernization/DEMO_RUNBOOK.md)
- [Emergency demo acceptance checklist](docs/modernization/DEMO_ACCEPTANCE_CHECKLIST.md)
- [Developer handover](DEVELOPER_HANDOVER_AND_FUTURE_ROADMAP.md)

## Local development

### Requirements

- Node.js `20.19+` or `22.12+` (Vite 8 engine requirement)
- npm and Git

### Setup

1. Install from the lockfile. The current Vite/esbuild peer range requires the legacy peer resolver:

   ```bash
   npm ci --legacy-peer-deps
   ```

2. Create a local environment and generate a unique development JWT secret:

   ```bash
   cp .env.example .env
   openssl rand -hex 32
   ```

   Set `JWT_SECRET` in `.env`. The default database URL uses an ignored local SQLite file (`prisma/local.db`); the tracked `prisma/dev.db` is sample data and should not be used for tests or production. Leave demo auth disabled unless you explicitly need a local role-switch demo. To create sample accounts, set a separate `SEED_DEMO_PASSWORD` before running the seed.

3. Initialize the local schema and optional sample data:

   ```bash
   npx prisma db push
   npm run seed
   ```

   `npm run seed` skips demo user creation unless `SEED_DEMO_PASSWORD` is explicitly set. Seed data is for local development only.

4. Start the API and web client in separate terminals:

   ```bash
   npm run server
   npm run dev
   ```

   Open `http://localhost:3000`. The Vite development server proxies `/api` requests to the API on port 5000. API liveness is at `http://localhost:5000/healthz` and database readiness is at `/ready`.

## Checks

- `npm run lint` — TypeScript check
- `npm run build` — Vite production build
- `npm run test:security` — authentication/authorization regression checks; requires an isolated SQLite test DB and seeded test account
- `npm run test:demo-workflow` — isolated server workflow regression for auth, farmer, collection pricing/idempotency, receipt and payout simulation
- `npm run test:demo-browser` — Playwright/Chromium flow for login, farmer, collection, receipt, dashboard refresh, Hindi navigation and mobile width; requires running API/Vite and an isolated seeded test DB
- `npm run test:phases` — mutating API smoke suite; requires a running API on port 5000, test credentials, and an isolated SQLite file named `test.db` or `r0-*.db`
- `npm run launch:check` — read-only database/API/build preflight; results do not certify launch readiness
- `npm audit --omit=dev` — production dependency audit

Do not point integration checks at `prisma/dev.db` or a production database. The phase suite writes collection, dispatch, telemetry, payout, quality and audit records. Its pass result means only that the scripted response checks passed.

Legacy Playwright QA scripts under `scripts/` also perform operational mutations and may attempt notification or payout interactions. They were not run in R0; use only with a disposable local database and test-mode integrations. The focused `test:demo-browser` script is separate and cleans its synthetic farmer/collection records on normal completion.

## Deployment status

The Docker Compose file currently supplies PostgreSQL while `prisma/schema.prisma` is configured for SQLite. There is no Prisma migration history. Do not use the current Compose configuration for production until the database provider, migration plan, backup/restore process and deployment wiring have been reconciled and reviewed. R0 does not migrate the production database.

The PWA manifest and service worker are present, but durable offline synchronization is not implemented. The Android/Capacitor app and Farmer Portal are not implemented. Payments, notifications, tax calculations, hardware integrations and AI fallback behavior require the limitations described in the audit before operational use.
