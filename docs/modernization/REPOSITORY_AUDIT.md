# R0 Repository Audit

**Scope:** source and configuration inspection plus safe local checks on branch `codex/r0-audit-security-foundation`. This is an R0 baseline, not a production certification.

## Inventory

The repository contains 156 tracked files. The executable application is a Vite/React/TypeScript client, an Express/TypeScript API, and a Prisma schema. The tracked SQLite database and `prisma/data_dump.json` contain seed/demo data and must not be treated as deployment data.

| Area | Evidence |
| --- | --- |
| Entry and navigation | `src/main.tsx`, `src/App.tsx`, `src/components/layout/Sidebar.tsx`, `Topbar.tsx` |
| 20 ERP screens | `src/pages/` (20 module pages plus `LoginScreen.tsx`) |
| Shared UI and operations | `src/components/common/`, `layout/`, `operations/`, `finance/`, `quality/`, `sales/`, `charts/` |
| State and calculations | `src/context/DairyERPContext.tsx`, `src/services/dairyEngine.ts`, `src/data/mockDairyData.ts` |
| Browser API client | `src/services/api.ts` |
| API and policy | `server/src/index.ts`, `middleware/auth.ts`, and 14 route files under `server/src/routes/` |
| Persistence | `prisma/schema.prisma` (20 Prisma models), `prisma/seed.ts`, tracked `prisma/dev.db`; no `prisma/migrations/` directory |
| PWA | `index.html` registers `public/sw.js`; `public/manifest.json` |
| Build and deployment | `package.json`, `package-lock.json`, `.github/workflows/ci.yml`, `Dockerfile*`, `docker-compose.yml`, `nginx.conf`, `.env*.example` |
| Verification | `scripts/verify_all_phases.ts`, `preflight_launch_check.ts`, `test_feature_mutations.ts`, Playwright/manual QA scripts and `qa_evidence/` screenshots |
| Project notes | Root README, roadmap, handover, codebase overview, final check report, release notes, repo notes, and `docs/DairyOS_Enterprise_ERP_Specification_and_Roadmap.md`; no `AGENTS.md` or `CLAUDE.md` found |

The Markdown files were read as context. Several describe integrations, coverage, production readiness, and data features more broadly than the code supports. For example, claims of hardened authentication, real-time financial settlement, durable offline support, and complete module persistence are not evidence of those properties in the current implementation.

## Runtime and baseline

`package-lock.json` resolves Vite 8, whose engine constraint requires Node `^20.19.0 || >=22.12.0`. The Dockerfiles and CI now use Node 20.19.0. The README's previous Node 18 minimum was inconsistent with the resolved toolchain. Local checks ran with Node `24.19.0` and npm `11.9.0`; Node 20.19.0 was not separately exercised in this workspace.

Checks run before the R0 edits:

| Check | Result |
| --- | --- |
| `npm ci` | **BLOCKED** by lockfile peer resolution: Vite 8.3.4 expects esbuild `^0.27.0 || ^0.28.0`, while the lock resolves esbuild 0.25.12. |
| `npm ci --legacy-peer-deps` | Passed; consistent with existing Docker/CI install convention. |
| `npm run lint` | Passed (`tsc --noEmit`). |
| `npm run build` | Passed. |
| `npm audit --omit=dev` | Passed; zero production dependency advisories at audit time. |
| `npm run test:phases` | 39/39 checks passed against a disposable copy of `prisma/dev.db`. This suite mutates operational records and was not run against the tracked database. |
| `npm run launch:check` | 14/14 checks passed against that isolated database. It is a smoke/preflight script, not launch approval. |

After the R0 changes, checks were repeated:

| Check | Result |
| --- | --- |
| `npm run lint` | Passed (`tsc --noEmit`). |
| `npm run build` | Passed. |
| `npm run test:security` | Passed against isolated `prisma/r0-security.db`, including the test database guard. |
| `npm run test:phases` | 39/39 passed against isolated `prisma/r0-integration.db`. Test output explicitly identifies this as a smoke suite, not production certification. |
| `npm run launch:check` | 15/15 passed against the same isolated DB; this is a read-only check, not a launch approval. |
| `npm audit --omit=dev` | Passed; zero production dependency advisories reported. |
| `git diff --check` | Passed. |

`npm ci` was blocked by the existing Vite/esbuild peer mismatch; `npm ci --legacy-peer-deps` passed. The suites exercise API examples, not every page or business workflow. No CodeQL/Semgrep CLI or workflow is present, so source static analysis was not run; `npm audit` is dependency scanning only. Docker images were inspected but not built or started in this environment.

Test limitations: the phase suite has weak assertions and seeded/static assumptions (for example, lower-bound tank volume comparisons and fabricated invoice/certificate data). `scripts/test_feature_mutations.ts` performs collection, cattle, farmer, feed, tank, processing, sales and payout actions through the UI; the Playwright QA scripts also include Lactoscan commit, notification, certification and payout interactions. These scripts were inspected but not run because they mutate records and may trigger external integrations; they also hardcode Windows browser paths. There is no dedicated unit-test framework or automated page-by-page accessibility/localization suite. Existing human QA screenshots are historical evidence, not reproducible tests.

## Confirmed findings

| Severity | Finding and evidence | R0 disposition |
| --- | --- | --- |
| Critical, fixed | `src/App.tsx` previously treated browser-stored auth state as sufficient and exposed role switching; login had a demo/fallback path. API business routes lacked a global auth boundary. | Server-validated login session, no browser auth flag as authority, explicit development-only demo control, server route authentication and role policy added. See [SECURITY_AND_DATA_INTEGRITY.md](SECURITY_AND_DATA_INTEGRITY.md). |
| High, fixed | Payment webhook handling had a permissive verification fallback, allowing unsigned/misconfigured callbacks to reach processing. | Missing secret and invalid HMAC now fail closed; raw-body HMAC-SHA256 comparison is constant-time. Provider event semantics and replay handling remain incomplete. |
| High | Compose config supplies PostgreSQL/Redis URLs, but `prisma/schema.prisma` uses SQLite; Prisma has no migration history. The current Docker deployment cannot use the declared PostgreSQL URL with this schema. | No production database migration in R0. Deployment must be blocked until a reviewed provider/migration plan is implemented. |
| High | Payment routes can write `Completed` records for a “simulation”; `/payments/disburse-all-pending` explicitly simulates a batch payout. There is no provider settlement proof or idempotency contract. | Documented as simulated; no live payment call was made. Do not treat these records as bank-confirmed. |
| High | Context mutations commonly update local state, show success, and append local audit events before async API calls; API failure only logs a warning (`DairyERPContext.tsx`, e.g. collection, processing, sales, payment, farmer, cattle). | Broad persistence behavior deferred; high-impact risk documented. |
| High | Per-module persistence is uneven. Several modules use local seeded state despite Prisma models, and several models lack API routes. | Inventory and roadmap document missing API/domain ownership. |
| Medium | Milk pricing is repeated across mock data, collection UI, mobile field UI, Lactoscan UI, API collection route, and IoT route. The common formula is base 34.5 + FAT delta × 4.5 + SNF delta × 2.5, with different rounding and quality handling. Settings values are not the authoritative calculation source. | No formula consolidation in R0 to avoid an unreviewed financial behavior change. |
| Medium | Collection IDs/references use timestamps/random values and have no client operation idempotency key. Client retry/queue can duplicate records. | Durable synchronization/idempotency deferred; test suite uses isolated DBs. |
| Medium | `MobileFieldView.tsx` offers a manual simulated offline toggle, stores an unacknowledged queue in localStorage, and empties it after a timeout without a server acknowledgement. | Not described as durable offline capability; migration path documented. |
| Medium | UI role filtering is separate from server role enforcement; role names and route permissions differ, and Farmer is not a frontend role. Farmer API access is currently denied by R0 policy until record-scoped access exists. | Global server policy added; full canonical permission model and scope enforcement deferred. |
| Medium | Service worker provides network-first caching but is not a durable data sync system. Manifest branding still uses blue/black colors while the app identity is forest green/sage/cream/gold. | PWA remains partial; visual and sync work in R1/R3. |
| Medium | Operational API validation is inconsistent; some routes use default values and accept client-supplied status/amounts; invoice and FSSAI certificate routes can fabricate fallback records/details. | No broad route redesign in R0; identified as blockers for reliable financial, tax, and food-safety records. |
| Low | No applied Prisma migration directory; seed scripts had a shared demo password path and could seed demo accounts by default. | Seed now requires explicit `SEED_DEMO_PASSWORD` and refuses production. Schema migration strategy is in the roadmap. |

## Module audit

All 20 current module pages are listed individually in [FEATURE_MATRIX.md](FEATURE_MATRIX.md). Most are **PARTIALLY WORKING** or **MOCK/SIMULATED** based on source inspection. No module is marked fully verified by a repeatable end-to-end browser test. Loading, error, mobile, accessibility, and Hindi behavior are uneven and generally **NOT VERIFIED** at module level.

## R0 files changed

R0 changes are limited to auth/session handling, server-side route access policy, payment webhook verification, explicit demo/seed controls, truthful notification/test behavior, test DB guards, CI/runtime config, and project documentation. No production database was migrated, no live payment/SMS was attempted, and no business formula was changed.
