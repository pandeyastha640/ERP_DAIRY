# DairyOS Enterprise UI — Balanced Density

## Scope and deployment
Design foundation is a shared React/Tailwind layer across both production and `VITE_DEMO_MODE=true` builds. Do not replace authoritative API workflows with synthetic successes. The static GitHub Pages demo must remain explicitly labeled and browser-local.

## Visual tokens
- Forest primary: `#163D2B`
- Action green: `#27835C`
- Canvas: `#F5F7F6`
- White surface: `#FFFFFF`
- Border: `#D9E3DD`
- Balanced surfaces use 12px radius, subtle shadows, 20px cards, 42px inputs, keyboard-visible focus.

## Navigation
Overview (Dashboard, Control Tower, Reports, AI Intelligence); Procurement (Milk Operations, Milk Collection, Farmers, Cattle, Feed); Plant Operations (Quality, Chilling, Processing); Supply Chain (Products, Packaging, Inventory, Distribution); Commercial & Finance (Sales, Payments, Finance); Administration (Settings).

Keep the canonical 20 module IDs and all role visibility constraints. Existing i18n state drives bilingual group headings.

## Acceptance matrix
| ID | Browser acceptance |
| --- | --- |
| VIS-01 | Desktop 1440×900: readable page title, no overlapping cards or obstructed actions. |
| VIS-02 | Tablet 768×1024: navigation and content remain accessible. |
| VIS-03 | Mobile 390×844: forms readable, tap targets at least 44px where practical, no page-wide horizontal overflow. |
| VIS-04 | Keyboard: focus indicator visible; all clickable KPI cards activate by Enter/Space. |
| VIS-05 | Navigation: all 20 module IDs accessible according to role; group labels switch English/Hindi. |
| VIS-06 | Farmer workflow: create synthetic farmer, search, refresh and reset in browser-only demo. |
| VIS-07 | Milk flow: 42.5L; FAT 4.4; SNF 8.6; 18°C; ₹36.55/L; ₹1,553 rounded payable; receipt matches. |
| VIS-08 | Safety: demo disclosures persist, no real API calls, payment settlement or hardware action in static mode. |
| VIS-09 | Network: zero missing assets on GitHub Pages /ERP_DAIRY/ base path. |
| VIS-10 | No uncaught console errors, no regression in production auth/permissions. |

## Development gates
```sh
npm ci --legacy-peer-deps
npm run lint
npm run build
npm run build:demo
npm run check:demo-artifact
npm run test:static-demo
```

Run Playwright browser acceptance and capture desktop/tablet/mobile screenshots separately; do not claim visual acceptance from a successful TypeScript build alone.

## Further work (D3–D7)
- D3: Guided farmer registration, collection workflow and receipt UX.
- D4: Quality, chilling, processing, herd, feed, product, packaging, inventory and dispatch modules.
- D5: Sales, payments, financial reconciliation, reports, AI, Control Tower and settings.
- D6: Translation audit, keyboard/screen-reader walkthrough, mobile touch QA.
- D7: Approved visual screenshot baselines, browser regression, security and deploy verification.

No unverified module mutation is considered complete.
