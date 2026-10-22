# 🥛 DairyOS — Complete Repository & Codebase Reference Guide

This document provides a single, exhaustive architectural overview and directory catalog of the entire **DairyOS** repository.

---

## 📑 Core Documentation Index

The repository maintains 5 specialized Markdown documentation files at its root:

1. **[DEVELOPER_HANDOVER_AND_FUTURE_ROADMAP.md](DEVELOPER_HANDOVER_AND_FUTURE_ROADMAP.md)**: Technical developer onboarding, architectural rules, day-1 workflow, and prioritized future direction backlog (cloud DB, payment gateways, i18n, mobile APK).
2. **[README.md](README.md)**: Official GitHub landing page, quickstart guide, Docker setup, cloud deployment options, and module summaries.
3. **[ORGANIZATION_HANDOVER_MANUAL.md](ORGANIZATION_HANDOVER_MANUAL.md)**: Executive handover manual, Standard Operating Procedures (SOP-01 to SOP-06), RBAC directory, hardware setup (Lactoscan, scale, thermal POS), and disaster recovery runbooks.
4. **[ROADMAP.md](ROADMAP.md)**: 15-phase enterprise engineering roadmap, system architecture diagrams (`mermaid`), and automated verification audits.
5. **[RELEASE_NOTES.md](RELEASE_NOTES.md)**: Version release notes (including the latest `v2.5.0-ENTERPRISE` with 3D visuals, calendar filters, and entity linking).

---

## 🗂️ Complete Directory & File Structure

```text
ERP_DAIRY/
├── .env                              # Server environment configuration (PORT=5000, DATABASE_URL)
├── .gitignore                        # Git ignore rules (unignores !prisma/dev.db)
├── Dockerfile                        # Multi-stage production container build
├── Dockerfile.api                    # Dedicated backend API container build
├── docker-compose.yml                # Multi-container orchestration (Web + API + Database)
├── index.html                        # Single-page application root HTML entry point
├── package.json                      # NPM dependencies, metadata, and lifecycle scripts
├── tsconfig.json                     # TypeScript compiler configuration
├── tsconfig.node.json                # Vite TypeScript compiler configuration
├── vite.config.ts                    # Vite 8 bundling, port:3000, and proxy configuration
│
├── prisma/                           # Database Layer (Prisma ORM & SQLite)
│   ├── dev.db                        # Active pre-seeded SQLite database binary (tracked on GitHub)
│   ├── data_dump.json                # 5,600+ line structured JSON database snapshot
│   ├── schema.prisma                 # 12 relational database models & schema definitions
│   └── seed.ts                       # Automated database population & sample record generator
│
├── server/                           # Backend Application Server (Node.js + Express + TypeScript)
│   └── src/
│       ├── index.ts                  # Express application gateway, middleware, & route mounting
│       ├── prisma.ts                 # Centralized PrismaClient singleton instance
│       ├── middleware/
│       │   └── auth.ts               # JWT authentication & Role-Based Access Control (RBAC)
│       └── routes/                   # REST API Routers (Mounted on /api/...)
│           ├── ai.ts                 # Google Gemini 2.5 AI forecasting & anomaly scanner
│           ├── auth.ts               # User login, session tokens, and role switching
│           ├── cattle.ts             # Cattle registry, yield logging, and health records
│           ├── chilling.ts           # Silo inventory, transfers, and mass balance audit
│           ├── collections.ts        # Milk intake ledger, 2-axis rate formula, slip generation
│           ├── farmers.ts            # Cooperative producer directory, KYC, passbooks
│           ├── federation.ts         # Village Societies (VDCS) & District Milk Union directory
│           ├── health.ts             # Docker /healthz & /ready liveness and readiness probes
│           ├── iot.ts                # Hardware serial bridge, Lactoscan stream, chiller probe
│           ├── metrics.ts            # Central control tower KPI calculations & mass balance
│           ├── notifications.ts      # Bilingual SMS / WhatsApp delivery gateway
│           ├── payments.ts           # Farmer passbooks, IMPS settlement, bank CSV export
│           ├── processing.ts         # Pasteurization batches, yield conversions, recipe BOM
│           ├── quality.ts            # Lab tests, adulteration strips, FSSAI tanker certificates
│           └── sales.ts              # Commercial order book, GST 3-ply invoices, E-Way bills
│
├── src/                              # Frontend Client Application (React 19 + TypeScript + Tailwind)
│   ├── main.tsx                      # React root rendering & DOM mount
│   ├── App.tsx                       # Master layout, top navigation, sidebar, and tab routing
│   ├── index.css                     # Tailwind CSS styles, dairy color variables, & animations
│   ├── types/
│   │   └── dairy.ts                  # Shared TypeScript interfaces & enterprise data contracts
│   ├── context/
│   │   └── DairyERPContext.tsx       # Centralized state provider, entity links, calculations
│   ├── services/
│   │   └── api.ts                    # Axios/Fetch client connecting frontend to backend :5000
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Topbar.tsx            # Global search, notification drawer, date badge, user role
│   │   │   └── Sidebar.tsx           # Collapsible module navigation (Tabs 00 through 19)
│   │   ├── charts/
│   │   │   └── Charts.tsx            # 3D isometric faceted bar charts & glowing trend curves
│   │   ├── common/
│   │   │   ├── MetricCard.tsx        # KPI summary cards with trend badges and icons
│   │   │   ├── StatusBadge.tsx       # Semantic status pills (Paid, Pending, Pass, Reject)
│   │   │   ├── Modal.tsx             # Reusable accessible dialog overlay
│   │   │   └── DesignSystem.tsx      # Palette constants (forest green, sage, cream, gold)
│   │   ├── operations/
│   │   │   ├── MilkMoneyTracerModal.tsx # End-to-end rupee & litre flow audit visualization
│   │   │   └── AuditLogDrawer.tsx    # Slide-over immutable system activity log
│   │   └── sales/
│   │       └── GSTInvoiceModal.tsx   # FSSAI & GST 3-ply tax invoice modal with PDF export
│   └── pages/                        # 20 Enterprise Modules
│       ├── DashboardPage.tsx         # Tab 00: Executive overview, pipeline, & unit economics
│       ├── MilkOperationsPage.tsx    # Tab 01: Operations control, 3D charts, calendar slicer
│       ├── CattleManagementPage.tsx  # Tab 02: Livestock registry, daily parlour yield, AI ledger
│       ├── MilkCollectionPage.tsx    # Tab 03: Intake desk, Lactoscan bridge, POS slip printer
│       ├── QualityManagementPage.tsx # Tab 04: Lab QC, adulteration strips, FSSAI certificate
│       ├── ChillingMilkPoolPage.tsx  # Tab 05: Silos A/B/C/D, IoT chiller boost, mass balance
│       ├── ProcessingPage.tsx        # Tab 06: HTST pasteurizer runs, BOM conversions, yield
│       ├── ProductCatalogPage.tsx    # Tab 07: Finished dairy SKU catalog & retail price lists
│       ├── InventoryPage.tsx         # Tab 08: Cold warehouse inventory, stock balance, reorder
│       ├── SalesPage.tsx             # Tab 09: Sales orders, GST 3-ply invoices, calendar filter
│       ├── DistributionPage.tsx      # Tab 10: Route logistics, reefer fleet, driver gate passes
│       ├── CooperativeFederationPage.tsx # Tab 11: 3-tier VDCS societies & District Union
│       ├── FeedManagementPage.tsx    # Tab 12: Ration inventory, nutritional specs, feed cost
│       ├── BreedingManagementPage.tsx# Tab 13: Bovine AI insemination & 280-day gestation schedule
│       ├── HealthVaccinationPage.tsx # Tab 14: FMD, BQ, Brucellosis vaccination schedules
│       ├── PaymentsPage.tsx          # Tab 15: Farmer passbooks, IMPS banking clearance
│       ├── FinanceProfitabilityPage.tsx # Tab 16: P&L statements, COGS, SKU contribution margins
│       ├── ReportsPage.tsx           # Tab 17: Regulatory FSSAI audit, spillage, loss analytics
│       ├── AIIntelligencePage.tsx    # Tab 18: Google Gemini neural intake forecast & optimizer
│       └── SettingsPage.tsx          # Tab 19: Organization profile, rates, hardware IoT ports
│
└── scripts/                          # Automated Audits, Verification & Tooling
    ├── export_data.ts                # Dumps all 12 SQLite tables into prisma/data_dump.json
    ├── verify_all_phases.ts          # End-to-end verification script for all 11 phases (39 tests)
    ├── preflight_launch_check.ts     # 14 production infrastructure and security health checks
    ├── test_feature_mutations.ts     # Mutation testing for business calculations and state
    └── qa_human_tester.ts            # Headless browser user journey simulation
```

---

## 🗄️ Relational Database Schema (Prisma Models)

The backend database (`prisma/dev.db`) contains 12 core tables:

1. **`Farmer`**: Cooperative farmer registry (Farmer Code, Name, Village, Contact, Bank Account, IFSC, Society ID).
2. **`Cattle`**: Individual animal registry (Ear-Tag ID, Breed, Age, Lactation Stage, Daily Milk Yield, Daily Feed Cost, Health Status).
3. **`MilkCollectionRecord`**: Individual intake vouchers (Shift, Time, Quantity, Fat %, SNF %, Rate, Payable Amount, Tester).
4. **`ChillingTank`**: Bulk insulated silos (Vats A, B, C, D capacities, volumes, thermal sensors, agitator status).
5. **`ProcessingBatch`**: Industrial pasteurizer runs (Line, Raw Input, Standardized Output SKUs, Yield %, Loss, Cost).
6. **`ProductMaster`**: Packaged finished goods catalog (SKU, MRP, Selling Price, Pack Size, Shelf Life).
7. **`InventoryItem`**: Warehouse stock levels (Opening, Inward, Outward, Closing Balance, Unit Cost).
8. **`DistributionRoute`**: Route logistics & dispatch (Route Code, Reefer Vehicle, Driver, Crates Dispatched, Cash Collected).
9. **`SalesOrder`**: Commercial order book (Order #, Customer, Channel, Product, Quantity, Amount, Tax Invoice, Payment State).
10. **`PaymentTransaction`**: Banking vouchers (Reference #, Farmer Name, Milk Litres, Gross Amount, IMPS Status).
11. **`AuditLogEntry`**: Immutable system audit trail (Timestamp, User, Role, Module, Action, Litres Impact, Financial Impact).
12. **`IoTDevice`**: Hardware peripherals (Lactoscan MCC, digital weighing scales, RTD PT100 temperature probes).

---

## 🔌 Backend REST API Directory (Port 5000)

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/ready` | `GET` | Health, database connection probe, uptime, and memory status |
| `/api/farmers` | `GET`, `POST` | Retrieve all registered farmers or create a new producer record |
| `/api/cattle` | `GET`, `POST` | Retrieve cattle herd records or log daily animal milking yield |
| `/api/collections` | `GET`, `POST` | Fetch collection ledger or ingest intake with 2-axis pricing |
| `/api/chilling/tanks` | `GET` | Live telemetry of all 4 insulated bulk silo tanks |
| `/api/chilling/reconciliation` | `GET` | Server-side closed-loop volumetric mass balance verification |
| `/api/processing/batches` | `GET`, `POST` | Inspect completed pasteurization runs or launch new batch |
| `/api/sales/orders` | `GET`, `POST` | Query commercial orders or create new sales order |
| `/api/sales/invoice/:orderNumber` | `GET` | Generate official 3-ply GST compliant tax invoice |
| `/api/payments/pending` | `GET` | Query total pending payables across all producers |
| `/api/payments/disburse` | `POST` | Execute batch IMPS banking payout to all eligible farmers |
| `/api/iot/devices` | `GET` | Telemetry status of all connected hardware instruments |
| `/api/iot/telemetry` | `POST` | Ingest real-time thermal readings from silo sensors |
| `/api/ai/forecast` | `GET` | 72-hour neural milk procurement volume prediction |

---

## 🛠️ NPM Script Reference

```bash
npm run dev           # Starts the Vite 8 React Frontend on http://localhost:3000
npm run server        # Starts the Node/Express Backend on http://localhost:5000
npm run dev:all       # Runs both Frontend and Backend concurrently in one terminal
npm run build         # Compiles the production frontend bundle into dist/ (sub-second)
npm run lint          # Executes TypeScript static type-checking (tsc --noEmit)
npm run db:export     # Dumps the entire SQLite database into prisma/data_dump.json
npm run studio        # Launches Prisma Studio visual database GUI on http://localhost:5555
npm run seed          # Seeds the database with 33 farmers, 53 cattle, and sample records
npm run test:phases   # Executes end-to-end automated audit across all 11 phases (39 tests)
npm run launch:check  # Runs 14 preflight production infrastructure and security checks
```
