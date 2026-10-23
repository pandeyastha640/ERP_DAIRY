# DairyOS Incremental Modernization Roadmap

Effort is relative: S (small), M, L, XL. Releases depend on the prior data/security gates. Scope is intentionally incremental; each release needs its own reviewed PR, acceptance evidence and rollback plan.

## R0 — Audit, baseline and security foundation (this branch)

- **Scope / effort:** source inventory, feature/status audit, auth foundation, server-side route guard, fail-closed webhook signature, demo/seed controls and planning docs. M.
- **Reuse:** existing React/Express/Prisma stack, auth routes, CI and isolated SQLite test workflow.
- **New:** auth regression test, safe database guard, audit/architecture/feature/UX/roadmap docs.
- **Dependencies / roles:** no production schema change; all future users affected by secure session. Dev demo remains explicit opt-in.
- **Data/API changes:** cookie session, default-deny API policies and fail-closed payment webhook; no table migration.
- **Risks:** legacy role strings and broad path policy need consolidation; stateless JWT logout is not revocation.
- **Acceptance/tests:** lint, build, dependency audit, auth regression, isolated phase smoke and preflight; all outcomes recorded truthfully.
- **Rollback:** revert R0 application code only after addressing exposure; disabling the old auth path is not an acceptable production rollback. Keep deployment blocked if environment secrets are absent.

## R1 — Shared design system, bilingual UI, identity and navigation

- **Scope / effort:** canonical role and permission catalogue; account provisioning/session lifecycle, password recovery/MFA design; shared form/table/status/loading patterns; English/Hindi shell; Simple/Advanced mode and role workspaces. L.
- **Reuse / new components:** evolve `DesignSystem`, `Modal`, `MetricCard`, `StatusBadge`, `Sidebar`, `Topbar`, `LoginScreen`; add localization catalogue/provider, permission-aware navigation, shared async form and status components.
- **Dependencies / roles:** R0 session policy. CEO, Administrator, Operations, Procurement, Plant, Finance, Collection Operator, Field Staff; Farmer remains excluded until scoped portal.
- **Data/API:** add user status/organization scope only with approved migration; `/auth/me` current role, session revoke/logout-all, account provisioning and permission metadata endpoints.
- **Risks:** mapping legacy `Admin`/`Administrator` and operator roles, access regression, translation quality and backward-compatible login rollout.
- **Acceptance/tests:** role/API matrix tests, session expiry/revocation tests, locale coverage, keyboard/axe checks, responsive shell test, security review of CSRF/CSP/rate limits.
- **Rollback:** feature flag new navigation and locale; retain compatible API response shape; revert UI independently of auth migration where possible.

## R2 — Farmer registry, milk collection, quality, ledger and Farmer Portal

- **Scope / effort:** authoritative farmer, collection, lab result, payable ledger and self-service read workflows. XL.
- **Reuse / new components:** collection modal, MobileFieldView, Lactoscan parser, quality screens, farmer registry; add shared pricing/quality domain module, collection command service, ledger and farmer portal shell/statement/dispute components.
- **Dependencies / roles:** R1 identity/permissions; approved cooperative rules for price and reject thresholds. Procurement Manager, Collection Operator, Field Staff, Finance Manager, Farmer.
- **Data/API:** cooperative/facility ownership; collection idempotency key; pricing policy version; relational collection→payable ledger; farmer login/ownership link; reviewed migration and backfill.
- **Risks:** financial formula drift, duplicate intake, legacy farmer code relationships, PII exposure and opening balance reconciliation.
- **Acceptance/tests:** same calculation across manual/device/offline-retry paths; atomic collection/payable/audit; duplicate retry creates one record; Farmer cannot access another farmer; reconciliation against approved fixture ledger; audit must prove persisted actor and time.
- **Rollback:** additive migration with dual-read/reconciliation window; stop new submissions via feature flag without deleting committed records; rollback through forward repair if ledger entries exist.

## R3 — PWA, Capacitor Android and durable offline synchronization

- **Scope / effort:** install/update lifecycle, mobile-first field workflows, durable local outbox and server acknowledgement/retry. XL.
- **Reuse / new components:** React Field View and device parser; add offline database adapter, operation envelope/ID, sync service, conflict queue and Capacitor shell/plugins only for confirmed hardware needs.
- **Dependencies / roles:** R1 session/device identity and R2 collection contract/idempotency. Field Staff and Collection Operator first; Farmer offline cache is separately restricted.
- **Data/API:** sync endpoint with idempotent commands, schema version and server receipt; device registration/revocation and minimal authorized cache.
- **Risks:** shared device/PII, duplicate or out-of-order commands, storage eviction, stale pricing, device clock errors, app signing and permission changes.
- **Acceptance/tests:** airplane-mode entry, app kill/restart, duplicate replay, partial batch failure, revoked user, stale schema, lost device, conflict recovery; no command removed until ack.
- **Rollback:** remote disable sync while retaining encrypted outbox for export/retry; maintain web online collection as fallback; version API and local queue formats.

## R4 — Plant, processing, inventory and distribution

- **Scope / effort:** tank ledger, mass balance, quality release, batch outputs, packaging/raw/finished inventory movements, dispatch and delivery. XL.
- **Reuse / new components:** current Chilling, Processing, Inventory, Distribution screens and TankerClearance modal; add movement ledger, lot/expiry traceability, batch-output and dispatch services.
- **Dependencies / roles:** R2 authoritative milk quality/collection; R1 Plant Manager and operator permissions.
- **Data/API:** transactional tank and inventory movements with source IDs, facility scope, lot/batch relations and audit actor. Reconciliation baseline must be observed/approved, not a hardcoded estimate.
- **Risks:** physical-vs-book variance, concurrency, food safety traceability, production downtime and unit conversion.
- **Acceptance/tests:** nonnegative capacity/stock, conservation-of-mass fixtures, atomic rollback, duplicate event idempotency, batch trace from source milk through lot to dispatch, supervisor reconciliation.
- **Rollback:** staged facility feature flags, read-only fallback, retain append-only movement history; reconcile before replay or reversal.

## R5 — Sales, payments, finance and reconciliation

- **Scope / effort:** approved product/GST masters, orders/invoices, receivables, farmer/supplier settlement requests, provider webhook state machine and close controls. XL.
- **Reuse / new components:** Sales, GST invoice, Payments, Bank Payout modal, Finance pages; add ledger, reconciliation, provider adapters, idempotent webhook inbox and approval queue.
- **Dependencies / roles:** R2 payable ledger and R4 stock allocation; Finance Manager/Administrator approval boundaries.
- **Data/API:** additive double-entry or audited subledger model, payment attempt/provider IDs, tax policy version, invoice numbering, settlement evidence and unique webhook event IDs.
- **Risks:** money movement, tax compliance, replay, split/partial payments and historical balances. No live bank action outside separately approved pilot.
- **Acceptance/tests:** ledger balances, amounts rounded as policy, authorized approval separation, simulated provider tests, duplicate/out-of-order/invalid webhook coverage, period close and rollback/reconciliation drills.
- **Rollback:** disable new external initiation; preserve event inbox and ledger; use manual reconciliation and forward corrections rather than deleting settled history.

## R6 — Dashboard, reports, Control Tower, AI and administration

- **Scope / effort:** permission-aware reporting, operational exception ownership, AI inputs/model labeling, admin/cooperative configuration. L.
- **Reuse / new components:** current dashboard, reports, control tower, AI pages, charts and settings; add server aggregation layer, report filters, alert assignment and model metadata/provenance.
- **Dependencies / roles:** validated records from R2–R5, identity, audit and stable domain APIs.
- **Data/API:** query/index strategy, report snapshot/export APIs, alert state and configuration audit. Avoid storing derived AI values as fact without approval.
- **Risks:** stale/biased aggregates, role leakage, false forecast confidence and high query load.
- **Acceptance/tests:** totals reconcile to source ledgers, role-scope tests, exports match UI, freshness labels, AI fallback/provider/error labels and no unauthorized mutation path.
- **Rollback:** disable individual dashboards/models, retain transactional systems and raw reports; no rollback of committed financial data.

## R7 — Single-cooperative production pilot

- **Scope / effort:** controlled operational rollout, training, support, backups, restore drill, monitoring, incident and reconciliation runbooks. L/XL depending on hardware and migration evidence.
- **Reuse / new components:** validated app from R1–R6; add pilot runbooks, dashboards, support/training and operational rollback controls.
- **Dependencies / roles:** signed acceptance of workflows, migrated and reconciled cooperative data, R2–R5 gates, security/privacy review, device readiness.
- **Data/API:** pilot cooperative and facility seed/migration, production secrets, backup schedule and recovery objectives; no multi-coop scale claims until tenant isolation is proven.
- **Risks:** staff adoption, connectivity, physical process mismatch, data conversion, payment and food-safety operational impact.
- **Acceptance/tests:** role-based training completion, reconciliation signoff, backup restore, incident exercise, mobile/offline tests on target devices, accessibility and security review, support escalation and rollback rehearsal.
- **Rollback:** disable new workflows by facility; maintain a reconciled manual process; preserve exportable records and never silently delete transactions.

## Shared architecture and quality gates

Keep a modular monolith: Presentation (shared React design system and role workspaces), Application/Domain (identity, procurement, quality, plant, inventory, commerce, finance, notifications, analytics), Infrastructure (Express adapters, Prisma repositories, providers). Keep policy and calculations in domain/application modules and transport/storage in adapters. Evolve SQLite schema only for development until PostgreSQL choice is made; then create reviewed, additive Prisma migrations and rehearse conversions/backups. The browser and Capacitor clients should share validated React/domain-facing logic but use server APIs as authority.

Each release requires lint/typecheck, production build, unit tests for calculations and validation, API permission tests, transactional/idempotency integration tests on isolated DB, focused browser workflow tests, accessibility/localization checks where relevant, dependency/security review, data migration/rollback rehearsal when schema changes, and updated docs. Do not call a release ready based on the existing smoke suite alone.
