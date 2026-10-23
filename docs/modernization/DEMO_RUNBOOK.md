# DairyOS Emergency Demo Runbook

This runbook starts the local demo against an isolated SQLite database. It does not configure a production service, real payout provider, notification provider, or physical device. PR #1 is still open; this feature branch is based on its security commit `998d3d3` and must be reviewed/merged after PR #1.

## Requirements

- Node.js 20.19.0 (CI tested); the resolved Vite 8 toolchain also accepts 22.12.0 and later compatible releases.
- npm and Git.
- Ports 3000 and 5000 available.
- A local password chosen for this demo. Do not reuse a production password.

Install dependencies from the lockfile:

```bash
npm ci --legacy-peer-deps
```

The plain `npm ci` currently fails dependency peer resolution because the lockfile resolves esbuild 0.25 while Vite 8 expects esbuild 0.27 or 0.28. The legacy resolver is also used by the repository's current container/CI setup.

## Initialize an isolated demo database

Run these commands from the repository root. `file:./r0-demo.db` resolves under `prisma/`; it is ignored by Git and separate from the tracked `prisma/dev.db`.

```bash
export DATABASE_URL='file:./r0-demo.db'
export NODE_ENV=development
export JWT_SECRET="$(openssl rand -hex 32)"
export DEMO_AUTH_ENABLED=true
export SEED_DEMO_PASSWORD='choose-a-unique-local-demo-password'
export DISABLE_LIVE_NOTIFICATIONS=true
export TWILIO_ACCOUNT_SID=''
export TWILIO_AUTH_TOKEN=''
export TWILIO_PHONE_NUMBER=''
export WHATSAPP_API_TOKEN=''
export WHATSAPP_PHONE_NUMBER_ID=''

npx prisma db push
npm run seed
npm run dev:all
```

Keep the shell running. `dev:all` starts the API on `http://localhost:5000` and the web application on `http://localhost:3000`. Open the web URL. The server will accept explicit local demo accounts because demo auth is enabled outside production. All seeded demo accounts use the password supplied in `SEED_DEMO_PASSWORD`; use `operations.manager@dairyos.enterprise` for the main demo.

The API validates a 32-character JWT secret at startup and refuses placeholder secrets in production. `DEMO_AUTH_ENABLED` is ignored in production. Live notifications are disabled outside production in this branch, and the demo environment keeps provider credentials empty. Payout batches are always simulation-only. Do not use `prisma/dev.db`, `prisma/data_dump.json`, or a production database for demo/test runs.

## Presenter sequence

1. Sign in as `operations.manager@dairyos.enterprise` with the local seed password.
2. Show the Dashboard and its server-loaded farmer supply metric. Historical chart points are illustrative demo values.
3. Open **Farmers & Procurement** → **Add Farmer**. Enter a synthetic name, village, phone, and cattle count. Save, close the detail ledger, and search by the new phone number.
4. Open **Milk Collection** → **Manual Entry**. Select the new farmer and enter:

   | Field | Value |
   | --- | ---: |
   | Quantity | 42.5 L |
   | FAT | 4.4% |
   | SNF | 8.6% |
   | Temperature | 18°C |
   | Shift | Morning |

5. Show the estimate: ₹36.55/L and ₹1,553 payable after the established whole-rupee rounding. Save and wait for the server-confirmed success. This record should be PASS under the current collection thresholds.
6. Open **POS Slip** for the saved row. Compare its farmer, collection code, readings, rate and payable with the row. The receipt says no provider settlement is confirmed. Do not click notification preview during the demo unless explicitly demonstrating its simulation-only response; do not print to a real device.
7. Open **Quality Testing** and point to the saved intake result. The status is read from the saved collection. Quality tests entered separately through the older lab form remain a distinct workflow.
8. Refresh the browser, open Milk Collection again, and show the same persisted record. Dashboard farmer supply should increase after reload.
9. Optional: open **Payments** and show the pending payable. If demonstrating **Run payout simulation**, state that no money moved and the payable remains pending.
10. Toggle **English | हिन्दी** to demonstrate translated navigation and core labels. Translation coverage is intentionally partial.
11. Sign out. The app returns to the login screen; protected API access requires a valid server session.

Use seeded synthetic farmers/products for any extra navigation. Do not claim that inventory, sales creation, SMS/WhatsApp delivery, banking, hardware, offline synchronization, or all dashboard charts are live integrations.

## Test and browser verification

The focused backend test uses an isolated SQLite path and synthetic data:

```bash
DATABASE_URL=file:./r0-demo.db NODE_ENV=test \
JWT_SECRET='replace-with-a-random-test-secret-at-least-32-characters' \
npx prisma db push

DATABASE_URL=file:./r0-demo.db NODE_ENV=test \
JWT_SECRET='replace-with-a-random-test-secret-at-least-32-characters' \
npm run test:demo-workflow
```

For the Chromium flow, start the API and Vite in separate terminals against a seeded `r0-demo.db`. Supply the test account password only through an environment variable:

```bash
DATABASE_URL=file:./r0-demo.db NODE_ENV=test \
JWT_SECRET='the-same-isolated-test-secret' \
DEMO_AUTH_ENABLED=true TEST_AUTH_EMAIL=operations.manager@dairyos.enterprise \
TEST_AUTH_PASSWORD='the-local-seed-password' npm run server
```

```bash
npm run dev
```

```bash
DATABASE_URL=file:./r0-demo.db NODE_ENV=test \
JWT_SECRET='the-same-isolated-test-secret' DEMO_AUTH_ENABLED=true \
DEMO_LOGIN_EMAIL=operations.manager@dairyos.enterprise \
DEMO_LOGIN_PASSWORD='the-local-seed-password' \
CHROMIUM_PATH=/path/to/chromium npm run test:demo-browser
```

The browser script requires Playwright and a local Chromium binary. It verifies invalid login rejection, session login/logout, farmer create/search persistence, collection calculation, saved receipt values, refetch/reload, dashboard farmer-supply change, 390 px horizontal overflow, and Hindi navigation. The workflow test and phase suite mutate records, so run them only against `test.db` or an ignored `r0-*.db` database.

## Known limits

- Farmer duplicate identity rules are not defined in the existing model; only server-generated farmer codes are unique. Phone duplicates are not blocked.
- Farmer records, collection, quality decision, tank intake, pending payable and audit record are covered by backend persistence for this path. The browser test verifies farmer/collection persistence and receipt values.
- Dashboard includes static historical trend points and other demo estimates. Collection-related totals use loaded collection records; do not present all KPIs as accounting reports.
- Inventory, processing outputs, and sales order forms still contain local/optimistic behavior. Do not demonstrate those as authoritative persisted workflows.
- Payout previews have `Simulated` status; ordinary payment writes cannot mark a payment `Completed`. A verified provider callback is not wired to a real payout provider.
- Offline mode is a localStorage simulation, not a durable acknowledged sync protocol. Android/Capacitor is not present.
- Hindi translation covers login/navigation and selected farmer/collection/mobile labels, not every module or error/empty state.
- PostgreSQL/production migration, backup/restore and deployment are not configured by this demo.

## Recovery

Stop both dev processes with Ctrl+C. For a clean synthetic demo, remove only `prisma/r0-demo.db`, then repeat the initialization commands. Do not delete or reset `prisma/dev.db` or any non-demo database. If the API fails to start, verify the JWT secret is at least 32 characters, the selected database path is local/ignored, and port 5000 is free. If the UI cannot reach the API, verify port 5000 and the Vite `/api` proxy before creating any records.
