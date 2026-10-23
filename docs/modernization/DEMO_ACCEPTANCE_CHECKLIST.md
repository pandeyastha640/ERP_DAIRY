# Emergency Demo Acceptance Checklist

Evidence below was captured on `codex/emergency-demo-ready` against isolated `prisma/r0-phases.db` / `prisma/r0-demo.db` SQLite databases with synthetic users and records. PASS applies only to the named behavior and check; it is not production certification.

| Check | Status | Verification evidence |
| --- | --- | --- |
| Login works | PASS | `scripts/test_demo_browser.ts` rejects an invalid password, then signs in with a seeded test account; `scripts/test_demo_workflow.ts` verifies an HttpOnly server session. |
| Logout works | PASS | Browser test signs out and sees the login screen; integration test verifies access without the cookie returns 401. |
| Dashboard loads | PASS | Chromium test reaches the Dashboard heading after login and after reload. |
| Farmer registration persists | PASS | Browser test submits a synthetic farmer and confirms the row exists through Prisma; API workflow test creates a farmer. |
| Farmer search works | PASS | Browser test searches the created farmer by phone; API workflow test confirms the same phone search returns the persisted farmer. |
| Milk collection calculates accurately | PASS | Browser/API tests use 42.5 L, FAT 4.4, SNF 8.6: server rate ₹36.55/L; server rounded payable ₹1,553. |
| Milk collection persists | PASS | API integration confirms exactly one row for an idempotent retry; browser test confirms persisted row and reload/refetch. |
| Receipt displays correct data | PASS | Browser test opens POS Slip and checks the saved ₹1,553; API test checks requested collection code, volume, rate, payable and no-transfer wording. Unknown receipt IDs return 404. |
| Quality status is consistent | PASS | Server collection test confirms PASS for FAT 4.4, SNF 8.6 and 18°C; Quality page lists the decision saved on that collection. This does not verify the separate manual lab workflow. |
| Chilling information loads | PARTIAL | `npm run test:phases` got 200 for tank/reconciliation APIs. The page’s historical opening/line-loss figures and browser presentation were not verified. |
| Inventory information loads | NOT TESTED | No inventory API/browser assertion was run. The current page uses local/context data and is not a supported persisted demo workflow. |
| Sales order works if supported | PARTIAL | Phase suite fetched invoice and tested dispatch against seeded data. The Sales page create/save path and its inventory effects were not verified; do not demo a new sales order as persisted. |
| Payment simulation is clearly labeled | PARTIAL | Integration and phase tests verify `simulationOnly`, persisted `Simulated` rows, no transfer, and unchanged pending balance. Payment screen was not included in browser automation. |
| Essential Hindi UI works | PARTIAL | Browser test toggles to Hindi and verifies the translated collection navigation title. Login and selected farmer/collection labels have translations; complete screens and error/empty states are not covered. |
| Mobile layout is usable | PASS | Chromium at 390×844 opens Milk Collection and reports no document-level horizontal overflow after the responsive top-bar fix. Modal and device-specific interaction were not tested at that viewport. |
| API failures show meaningful messages | PARTIAL | API integration verifies invalid collection quantity returns 400 without persistence. UI farmer/collection handlers show errors in source, but forced server failure presentation was not exercised in the browser. |
| Tests pass | PASS | `npm run lint`, `npm run build`, `npm run test:security`, `npm run test:demo-workflow`, `npm run test:demo-browser`, `npm run test:phases` (39/39), `npm run launch:check` (15/15), `npm audit --omit=dev` (0 advisories), `git diff --check`. See branch validation notes in the PR. |
| Application can be launched and demonstrated | PASS | Local Vite (`http://localhost:3000`) and API (`http://localhost:5000`) started against seeded isolated `r0-phases.db`; the Chromium run completed the login → farmer → collection → receipt → reload → mobile → Hindi → logout sequence. |

## Demo boundary

- **Persisted and exercised:** authentication/session, farmer create/search, milk collection, server quality decision, collection-linked pending payable, receipt lookup and idempotent collection retry.
- **Simulation only:** payout preview and notification preview; no bank transfer or message is sent in non-production.
- **Not established as authoritative:** all dashboard figures, inventory, new sales order creation, processing outputs, durable offline sync, Android APK, physical analyzer/printer support, and production operation.
