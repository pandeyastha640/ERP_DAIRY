# 🥛 DairyOS — Master ERP Repository Guide (`ERP_REPO.md`)

* **GitHub Repository URL:** [https://github.com/pandeyastha640/ERP_DAIRY](https://github.com/pandeyastha640/ERP_DAIRY)
* **Default Branch:** `main`
* **Platform Name:** DairyOS Enterprise Dairy & Cooperative Management Platform
* **Live Local Applications:**
  * Frontend Web Console: `http://localhost:3000`
  * Backend REST API: `http://localhost:5000`
  * Prisma Database GUI: `http://localhost:5555`

---

## 📖 What is this ERP Repository?

This repository contains the complete, production-ready source code, database, and operational documentation for **DairyOS**: an end-to-end Enterprise Resource Planning (ERP) platform for commercial dairy processing plants, chilling centres, and cooperative milk producer unions (Amul/Anand model).

It covers the complete journey of milk:
$$\text{Cow / Herd Milking} \longrightarrow \text{Farmer Village Procurement} \longrightarrow \text{Cold Silo Chilling} \longrightarrow \text{HTST Pasteurization} \longrightarrow \text{Inventory & Packaging} \longrightarrow \text{Route Logistics} \longrightarrow \text{Commercial Sales & Invoicing}$$

---

## 🗂️ What is in this ERP Repository? (Full Inventory)

### 1. The 20 ERP Modules (Frontend & Backend)
1. **Tab 00: Executive Dashboard (`DashboardPage.tsx`)**: High-level KPIs, 3D charts, live milk-flow pipeline, unit economics, mass balance equation.
2. **Tab 01: Milk Operations (`MilkOperationsPage.tsx`)**: Daily shift consolidation (Morning/Evening), 3D comparison charts, calendar date slicers, mass reconciliation.
3. **Tab 02: Cattle Herd Management (`CattleManagementPage.tsx`)**: Ear-tagged livestock registry, daily parlour yield logging, lactation curves, feed costs.
4. **Tab 03: Milk Collection Desk (`MilkCollectionPage.tsx`)**: Village intake desk, digital Lactoscan MCC integration, 2-axis Fat/SNF pricing, 58mm/80mm thermal POS slips.
5. **Tab 04: Quality Management & QC Lab (`QualityManagementPage.tsx`)**: Adulteration testing (urea, starch, detergent), MBRT, alcohol COB, FSSAI Bulk Tanker Lab Clearance Certificates.
6. **Tab 05: Chilling Centre & Bulk Milk Pool (`ChillingMilkPoolPage.tsx`)**: 4 insulated silos (Vats A, B, C, D), IoT temperature telemetry, glycol chiller booster, zero-loss mass balance.
7. **Tab 06: Dairy Processing & Pasteurization (`ProcessingPage.tsx`)**: Continuous HTST line runs (72°C for 15s), cream separation, dynamic recipe BOMs, yield & loss accounting.
8. **Tab 07: Product Catalog (`ProductCatalogPage.tsx`)**: Master finished goods SKU catalog, packaging specifications, wholesale & MRP price lists.
9. **Tab 08: Finished Goods Inventory (`InventoryPage.tsx`)**: Cold warehouse inventory, batch expiration tracking, stock reorder alerts.
10. **Tab 09: Sales Orders & Revenue (`SalesPage.tsx`)**: Commercial order book, GST 3-ply invoices (HSN `0401/0405/0406`), calendar date filter, dispatch tracking.
11. **Tab 10: Route Logistics & Fleet (`DistributionPage.tsx`)**: Reefer van dispatch, crate balancing, driver route tracking, delivery gate passes.
12. **Tab 11: Cooperative Federation Hierarchy (`CooperativeFederationPage.tsx`)**: 3-tier structure (Village Societies VDCS &rarr; District Milk Union &rarr; State Federation).
13. **Tab 12: Feed Management (`FeedManagementPage.tsx`)**: Cattle feed stock, silage, dry fodder, concentrates, nutritional balancing.
14. **Tab 13: Breeding & Reproduction (`BreedingManagementPage.tsx`)**: Artificial Insemination (AI) registry, semen straw codes, 280-day bovine gestation schedule.
15. **Tab 14: Animal Health & Vaccinations (`HealthVaccinationPage.tsx`)**: FMD, Black Quarter, and Brucellosis immunization schedules with booster alerts.
16. **Tab 15: Farmer Payments & Settlement (`PaymentsPage.tsx`)**: Producer passbooks, gross payables, automated batch IMPS banking disbursements.
17. **Tab 16: Finance, Costing & Profitability (`FinanceProfitabilityPage.tsx`)**: Comprehensive P&L statement, processing utilities cost, SKU gross contribution margins.
18. **Tab 17: Reports & Analytics (`ReportsPage.tsx`)**: FSSAI regulatory compliance audits, spillage & evaporation loss analysis, daily shift reports.
19. **Tab 18: Google Gemini AI Operations (`AIIntelligencePage.tsx`)**: 72-hour neural milk intake prediction, least-cost feed ration optimizer, plant anomaly scanner.
20. **Tab 19: Organization Settings (`SettingsPage.tsx`)**: Cooperative profile, base pricing parameters, hardware IoT port configurations, user roles.

---

### 2. Pre-Loaded Backend Data (Stored Inside the Repository)
Unlike typical projects that come empty, this ERP repository contains **real, active pre-loaded data**:
* **Database File (`prisma/dev.db`)**: Pre-seeded SQLite database with:
  * **33 Registered Cooperative Farmers**
  * **53 Ear-Tagged Cattle Records**
  * **51 Verified Milk Collections**
  * **4 Insulated Silos with Telemetry**
  * **7 Processing Runs**
  * **19 Commercial Sales Orders**
  * **128 Audit Trail Ledger Records**
* **JSON Data Dump (`prisma/data_dump.json`)**: 5,600+ lines of formatted data viewable directly in GitHub's web interface.

---

### 3. How to Share and Run This Repository
Anyone who clones this repository can boot the complete system with two commands:

```bash
git clone https://github.com/pandeyastha640/ERP_DAIRY.git
cd ERP_DAIRY
npm install
npm run dev:all
```

Or with Docker in a single command:
```bash
docker compose up --build
```

---

### 4. Complete Documentation Files in this Repository
* **[ERP_REPO.md](ERP_REPO.md)**: *(This file)* Master guide of the ERP repository.
* **[DEVELOPER_HANDOVER_AND_FUTURE_ROADMAP.md](DEVELOPER_HANDOVER_AND_FUTURE_ROADMAP.md)**: Developer onboarding and future roadmap (Cloud DB, Payment keys, i18n, Mobile APK).
* **[CODEBASE_OVERVIEW.md](CODEBASE_OVERVIEW.md)**: Full file tree, REST API endpoints, database schema.
* **[ORGANIZATION_HANDOVER_MANUAL.md](ORGANIZATION_HANDOVER_MANUAL.md)**: Standard Operating Procedures (SOP-01 to SOP-06), RBAC roles, hardware setup.
* **[ROADMAP.md](ROADMAP.md)**: 15-phase implementation plan and automated test audit results.
* **[RELEASE_NOTES.md](RELEASE_NOTES.md)**: Version release notes (`v2.5.0-ENTERPRISE`).
* **[README.md](README.md)**: Main GitHub landing page.
