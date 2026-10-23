# Security and Data Integrity Findings

## Authentication and session changes in R0

Before R0, browser local storage could make the UI appear authenticated, the login flow had demo/fallback behavior, and business API routes had no common authentication/authorization boundary. R0 changes the flow as follows:

- API startup requires `JWT_SECRET` (at least 32 characters); production rejects known placeholder patterns.
- Password login uses the stored bcrypt hash only. The shared `password123` fallback was removed. Seed demo users require an explicit `SEED_DEMO_PASSWORD`; production seeding is refused.
- Session JWT is delivered in an HttpOnly, SameSite Strict cookie with an eight-hour expiry; browser JavaScript does not receive a token. Production sets `Secure`.
- App bootstrap and login call `/auth/me`; old local auth/role flags are cleared and no longer grant entry. Logout clears the session cookie and client state.
- Demo role switch is disabled unless `DEMO_AUTH_ENABLED=true` in a non-production server and the UI additionally has an explicit Vite development opt-in.
- Every `/api/v1` business route now passes through authentication and a default-deny role policy. Payment webhook is exempt from browser sessions but requires HMAC verification. Unknown API paths have no access policy and are denied.
- CORS accepts configured production origins and local origins only outside production.

Regression coverage in `scripts/test_auth_security.ts` checks required/placeholder secrets, demo gates, invalid/missing sessions, fallback password rejection, cookie behavior, valid sessions, role allow/deny, Farmer denial, expired JWT, and webhook fail-closed behavior. It uses an isolated SQLite test database.

## Authorization boundaries and remaining risks

The current role strings are legacy and do not yet implement the requested canonical role model consistently. UI `Role` includes CEO, COO, Operations Manager, Plant Manager, Procurement Manager, Finance Manager, Field Staff, and Admin. The R0 API policy also recognizes Administrator, Collection Operator, and Farmer (denied); there is no UI Farmer account. API authorization is coarse path/method policy and is not row/facility scoped. `Farmer` and `MilkCollectionRecord` contain cooperative identifiers, but most models and all `User` records lack a mandatory cooperative relation. Future Farmer access must scope every farmer-owned query and mutation by the authenticated principal's farmer identity, not by request parameters.

Recommended future permission boundary (to implement and test in R1/R2):

| Role | Default scope and allowed work |
| --- | --- |
| CEO | Cooperative-wide management read and approval dashboards; high-impact financial/configuration actions remain separately authorized and audited. |
| Administrator | User, role, facility and policy administration; no implied right to initiate or approve their own financial settlement. |
| Operations Manager | Cooperative operational oversight and approved cross-module workflow actions; no access to identity secrets or finance-only settlement approval by default. |
| Procurement Manager | Farmer registry, collection, quality and payable review within assigned cooperative/facilities; rate-policy changes require versioning and approval. |
| Plant Manager | Assigned plant quality, chilling, processing, plant inventory and dispatch workflows; cannot settle farmer payments by default. |
| Finance Manager | Ledger, reconciliation, invoices and payment initiation/approval within assigned cooperative scope; separate initiator and approver for high-value payout. |
| Collection Operator | Collection and quality intake at assigned centre, minimal farmer lookup and receipt status; no bank details, unrelated farmer history or payout approval. |
| Field Staff | Assigned route/centre intake and only farmer data needed for that task; queue remains bound to user/device and is revoked on account change. |
| Farmer | Own profile, own collections, quality results, payable statement and dispute submission only; every query is constrained by the authenticated farmer-to-account link. |

Authorization should compose role capability with cooperative, facility, centre, farmer/record ownership, operation state and (for payments/configuration) approval limits. Default deny unknown action/resource pairs. A UI role list is presentation only; API and data query scope are authoritative.

Other residual risks:

- JWT logout clears the browser cookie but does not revoke an already copied JWT before its eight-hour expiry. There is no refresh-token rotation or revocation list.
- JWT carries role/name values. Role changes in the DB are not loaded by the general middleware until a new token is issued; `/auth/me` checks user existence, not token revocation or current role on each request.
- SameSite Strict reduces cross-site cookie sending, but CSRF/origin policy should be explicitly tested for the deployed topology. CORS is not a substitute for CSRF protections.
- Password reset, MFA, rate limiting, lockout, account provisioning, session audit, secret rotation, and organization SSO are not implemented/verified.
- `helmet` has Content Security Policy disabled. Production CSP, secure proxy headers, transport TLS, secret storage, log redaction, and deployment hardening need review.
- API error handlers return exception messages. Authentication logs and request logs need production privacy review.
- Role policy currently lets some broad legacy roles use many API routes; UI and API policies can drift. A canonical permission catalogue with automated route coverage is required.

## Data and workflow risks

### Milk collection and pricing invariants

Observed formula family: `rate = max(0, round2(34.5 + (FAT - 4.0) × 4.5 + (SNF - 8.5) × 2.5))`; failed quality sets rate to zero in some paths; payable uses either `round(quantity × rate)` or two decimal places in another route. Thresholds include FAT < 3.2, SNF < 7.8, temperature > 24°C for fail, and warning at temperature > 20°C or FAT < 3.8 in some components. The same formula is duplicated in client, mock data and API/IoT routes. Do not consolidate until cooperative-approved policy and existing expected rounding are captured in regression fixtures.

Target invariants:

1. One versioned/effective-dated rate policy calculates the same rate for manual, mobile and device intake.
2. Collection quantity is positive and within calibrated device/business limits; FAT/SNF/temperature are bounded and quality result is derived server-side.
3. `payable = approved rounding(quantity × rate)`; collection and payable ledger entry commit atomically.
4. Repeated request with the same operation ID returns the prior result and cannot create a second collection/payable.
5. Every accepted collection contributes exactly once to the cooperative/facility/period totals.

R0 leaves formula behavior unchanged.

### Silo mass balance and inventory

- Collection API adds `round(quantity)` to `TANK-B` and caps at capacity, which can lose volume from physical accounting. UI context adds rounded volume as well.
- Processing API uses a transaction to deduct milk and create a batch; it can reduce packaging and creates an audit entry in that transaction. It does not store product outputs or reconcile the declared yield/wastage to batch volume.
- Tank transfer uses a transaction and checks both source and target values, but concurrent updates need isolation/conditional updates to prevent stale-read overdraw/overfill.
- Reconciliation uses a hardcoded 9,000 L opening baseline, 14.5 L CIP loss and a herd fallback 550 L/day. It labels an inferred estimate as verified mass balance.
- Inventory page and finished goods movements are context/localStorage calculations; no inventory API or movement ledger exists. Sales/processing effects are not transactionally joined with inventory.

Target invariants: opening + measured inflows − measured processing/dispatch/loss = closing; tank volume stays between zero and capacity; products and packaging cannot go negative; each movement has a unique source event and is committed with its source operation.

### Farmer payables, payments, tax and audit

- Collection route creates a `Pending` payment in the same transaction as the collection, but payment is not relationally keyed to the collection. Client context separately creates a local pending payment.
- Emergency demo changes make ordinary payment entries `Pending`; the server rejects client attempts to write `Completed`. Batch payout previews persist with `Simulated` status and do not reduce the pending balance. Provider settlement is still not implemented. Payment matching and aggregation still need cooperative/period/farmer scoping.
- Payment pending summary subtracts all farmer `Completed` payments from all collection payables without cooperative/period/farmer allocation.
- Invoice route can create a missing order with fixed example facts; seller GST/FSSAI and tax treatment are hard-coded. GST invoice output is not verified for tax compliance.
- Some audit records are created in transactions, others after mutation, and client audit entries are local-only with placeholder actors. They are not a reliable immutable ledger.

Target invariants: a settlement request is not a settlement; provider-confirmed state must have verified, deduplicated provider event evidence. Payable allocation must be farmer-, period-, and currency-specific with ledger entries that balance. Tax must use reviewed product/place-of-supply masters and explicit inclusive/exclusive pricing. Audit event and business mutation commit atomically and capture authenticated actor and scope.

## Webhook changes and remaining integration work

R0 verifies raw request bytes against configured HMAC-SHA256 with constant-time comparison. Missing secret returns 503; missing/malformed/invalid signature returns 401; the code does not process the event before verification. This does not establish provider authenticity by itself until the deployed provider's exact signature header/canonicalization is implemented. Event ID uniqueness exists for webhook logs, but duplicate/replay semantics and mapping of provider status to settlement state are incomplete. No real gateway callback or payment was used in tests.

## Browser storage and offline data

`DairyERPContext` persists multiple business datasets in localStorage. The API client now requests fresh responses rather than accepting stale conditional 304 responses for server-backed state. The PWA service worker caches static/navigation responses but bypasses API routes. `MobileFieldView` still stores a manual offline simulation in localStorage; online saves wait for server confirmation and failed queue retries remain queued. There are no durable transactional queue, conflict resolution, or access-scoped cache. Farmer, contact and bank information may be present in cached browser data. Logout should clear sensitive local caches once data ownership is migrated.

## Emergency demo hardening

- Collection UI now submits only measured values plus a request ID; server-calculated quality, rate and rounded payable are returned before UI success. Duplicate retries return the original row; a request ID reused for different values is rejected.
- Receipt lookup returns 404 for a missing collection rather than substituting a different/latest collection. Receipt fields come from the saved record; demo FSSAI/weight/analyzer and direct-settlement claims were removed.
- Non-production notification calls are explicitly simulated and do not call Twilio/WhatsApp even if credentials are present. A simulation is labeled as not sent. Production provider delivery semantics still require provider-specific work and approval.
- Browser localStorage is no longer authoritative for login. API calls use `cache: 'no-store'` so reloads retrieve fresh backend records rather than stale 304 responses.

See the targeted tests in `scripts/test_demo_workflow.ts` and `scripts/test_demo_browser.ts`; broader limitations remain listed in the feature matrix and demo checklist.

Future offline protocol: encrypted device database; minimal role/facility-scoped cache; UUID operation ID and schema version; server idempotency record; client retains command until acknowledgement; retry only transient failures with backoff; explicit rejected/conflict state for supervisor resolution; logout/account switch cache purge; queue audit and tests covering crash/restart, clock skew, duplicate sync and revoked access.

## Migration and release gates

Do not deploy the current Docker Compose as production persistence: Prisma is SQLite-configured while Compose supplies PostgreSQL. R0 did not change the production DB. Before R2/R3 pilot data: choose a provider, define an additive migration and backup/restore plan, validate row counts and checksums in a rehearsal, preserve unique/foreign-key constraints, establish a rollback procedure, and keep payment/collection totals reconciled. No migration against the tracked DB was run.
