# DairyOS GitHub Pages Demo

## What is published

GitHub Pages serves the Vite static build at `/ERP_DAIRY/`. The build sets `VITE_DEMO_MODE=true`, aliases the production mock dataset import to [staticDemoData.ts](../../src/data/staticDemoData.ts), and disables authentication, API calls, server synchronization, and the event stream. The normal `npm run build` and local API proxy remain configured for the real ERP application.

The demo uses synthetic farmers, collection records, products, inventory, quality results, and payment previews. The visible notice explains that changes stay in the current browser. Demo data uses a versioned `dairyos-static-demo-v1-data:` localStorage namespace; demo role, language, and offline queue have separate demo-only keys. **Reset Demo Data** restores the original sample records and clears demo records and the demo offline queue. It does not touch production keys.

The role picker is a local presentation control. It does not authenticate a server session or grant access to backend records. Collection and farmer changes are local sample interactions. Payment previews never move funds. Notifications and physical hardware are disabled. Quality snapshots and sales summaries are explicitly non-official; they do not generate a tax invoice, regulatory certificate, gate pass, or settlement evidence. Hindi text covers the login, navigation, dashboard and shared workflow strings; other modules remain partly English.

## Repository and Pages settings

The source repository remains private. GitHub Pages availability for a private source repository depends on the owner’s GitHub plan and organization policy; GitHub Free generally requires a public repository for Pages. Do not change repository visibility for this demo.

After the prerequisite security and workflow pull requests are merged, a repository owner with Pages and Actions permissions must select:

**Settings → Pages → Build and deployment → Source: GitHub Actions**

The deployment workflow is `.github/workflows/deploy-pages.yml`. It triggers after pushes to `main` and supports manual `workflow_dispatch`. It uses Node.js 20.19.0, `npm ci --legacy-peer-deps`, TypeScript validation, the static demo build, and the official GitHub Pages Actions. No frontend secrets or backend credentials are required.

The expected URL is `https://pandeyastha640.github.io/ERP_DAIRY/`. Treat it as **not live** until the Pages deployment succeeds and that public URL has been opened and checked. A successful feature-branch build does not publish the site.

## Local build and preview

Requirements: Node.js 20.19.0 and npm. From the repository root:

```sh
npm ci --legacy-peer-deps
npm run lint
npm run build:demo
npm run preview:demo
```

Open `http://127.0.0.1:4173/ERP_DAIRY/`. The base-aware preview server mounts `dist/` at the same project path GitHub Pages will use. The project uses in-app state navigation rather than URL routes, so refresh returns to the dashboard/login state at the same base path. Do not use the normal production `npm run build` artifact as the public demo; it is not configured to substitute the synthetic demo records.

## Presenter sequence

1. Open the base-path preview or the verified Pages URL.
2. Choose **Chief Executive Officer** under **Choose a Demo Role**. This is a local demo role, not a server login.
3. Open **Farmers & Procurement**, choose **Add Farmer**, enter a sample name, village, and cattle count, then save. Search and open the sample profile. Contact and bank details are not collected.
4. Open **Milk Collection**, choose **Manual Entry**, select the sample farmer, and enter 42.5 L, FAT 4.4, SNF 8.6, and 18°C. The sample formula previews ₹36.55/L and ₹1,553 payable; save adds one browser-local sample collection.
5. Select **POS Slip** on the saved row to preview a sample receipt. The values come from that browser-local collection; it is not an official receipt or proof of payment.
6. Visit the Quality, Chilling, Inventory, Products, Sales, Payments, Reports, and other modules from the sidebar. Sales summaries and payment previews remain visibly marked as samples.
7. Refresh to confirm the local farmer and collection remain. **Reset Demo Data** restores the original sample state.

For a quick repeatable browser check, start the preview and run `npm run test:static-demo` in another terminal.

## Safety and limitations

GitHub Pages hosts static files only. It does not run Express, Prisma, a database, authentication, server permissions, SMS/WhatsApp, a banking provider, or hardware integrations. Local demo state is scoped to one browser profile and device, can be cleared by browser storage cleanup, and is not synchronized or backed up. Sample calculations illustrate existing pricing rules; they are not authoritative financial records. Hindi coverage is partial. The static mode intentionally does not register a service worker.

The Pages artifact is `dist/`, produced by Vite from frontend entry points and the public icon/manifest. It must not include `.env` files, SQLite/database dumps, Prisma data, backend source, tokens, or production records. Review the built artifact when changing public data sources or build aliases.

## Deployment and troubleshooting

- To redeploy after merge, push an update to `main` or run **Actions → Deploy static DairyOS demo to GitHub Pages → Run workflow**.
- If the workflow cannot start, check that Actions are enabled and that the repository has Pages permission for its plan and visibility.
- If the deploy job reports Pages is not configured, set the Pages source to **GitHub Actions** and rerun the workflow.
- If assets return 404, confirm the build used `VITE_DEMO_MODE=true` and that the URL includes `/ERP_DAIRY/`.
- If sample changes are unexpected, use **Reset Demo Data** or clear keys beginning `dairyos-static-demo-v1-` in this browser. Do not clear unrelated DairyOS production keys for the demo.
- GitHub Pages deployment is separate from backend/production deployment. The real ERP continues to use its standard server-backed build with `VITE_DEMO_MODE` unset.

## Pull request dependencies

This deployment branch is based on the open security hardening PR #1 and the open farmer/collection demo improvements PR #2. Neither prerequisite is merged as of this change set. Review and merge those PRs in dependency order before merging this Pages integration PR; do not merge them from the deployment workflow. The Pages workflow only deploys from `main`.
