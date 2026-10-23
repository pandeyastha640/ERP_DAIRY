# DairyOS Enterprise Dairy Operating System
## Official Organization Handover & Standard Operating Procedures (SOP) Manual
**Version:** v2.1.0-PRODUCTION  
**Author:** Head of Technology & Engineering  
**Classification:** Enterprise Operational Documentation  
**Target Audience:** Cooperative Executives, Plant Managers, Quality Chemists, Procurement Leads, Field Agents, IT Administrators

---

## 1. Executive Summary & Platform Overview

**DairyOS** is a next-generation, cloud-and-edge Dairy Enterprise Resource Planning (ERP) platform architected specifically for dairy processing plants, district cooperative milk producer unions, and affiliated Village Dairy Cooperative Societies (VDCS).

The platform digitizes the complete **"Cow to Consumer"** supply chain:
1. **Livestock Breeding & Herd Health:** Artificial Insemination (AI), 280-day gestation calendars, estrus tracking, and FMD vaccination booster scheduling.
2. **Village Milk Procurement:** Automated intake with Milkotronic Lactoscan MCC serial analyzer integration, load-cell scales, and real-time fat/SNF 2-axis pricing formulas.
3. **Cold Chain & Bulk Silos:** Chilling silo temperature telemetry, glycol chiller monitoring, and real-time milk pool mass-balance reconciliation.
4. **Dairy Processing Plant:** Continuous HTST pasteurization batch formulation with dynamic Bills of Materials (BOM) and yield loss analytics.
5. **Quality & Compliance:** FSSAI Form E Bulk Tanker Clearance Certificates with Chief Chemist cryptographic sign-off.
6. **Commercial Revenue & Logistics:** 3-Ply GST Tax Invoices (HSN 0401/0405/0406), automated CGST/SGST splitting, E-Way bills, and reefer route fleet tracking.
7. **Direct Farmer Banking:** Instant IMPS/UPI batch disbursements and corporate NEFT payment processing.

---

## 2. Organization User Accounts & RBAC Directory

DairyOS enforces strict **Role-Based Access Control (RBAC)** to comply with food safety, audit, and financial guidelines.

| Role | Default Login / Session | Accessible Modules | Core Responsibility |
| :--- | :--- | :--- | :--- |
| **Chief Executive Officer (CEO)** | `ceo@dairyos.enterprise` | All 19 Modules | Executive Control Tower, P&L Margins, Corporate KPIs |
| **Operations Manager** | `operations.manager@dairyos.enterprise` | All Operational Modules | Central Milk Pool, Chilling Silos, Processing, Logistics |
| **Plant Manager** | `plant.manager@dairyos.enterprise` | Chilling, Processing, Quality, Inventory, Products | HTST Line Execution, Silo Transfers, Packaging Stock |
| **Procurement Manager** | `procurement.manager@dairyos.enterprise` | Farmers, Milk Collection, Cattle, Feed, Payments | Cooperative Producer Relations, Rates, Route Sourcing |
| **Finance Manager** | `finance.manager@dairyos.enterprise` | Payments, Finance, Sales, Reports, Farmers | P&L Ledger, Cost-per-Litre, Banking Disbursements |
| **Field Staff / Collection Agent** | `field.staff@dairyos.enterprise` | Milk Collection, Farmers, Quality | Touch Field Mode, Lactoscan Intake, POS Slips |

*Local sample accounts require an explicit `SEED_DEMO_PASSWORD` value and are disabled by default. Role switching requires `DEMO_AUTH_ENABLED=true` and `VITE_ENABLE_DEMO_AUTH=true` in development. Never use sample accounts or credentials in production.*

---

## 3. Standard Operating Procedures (SOP)

### SOP-01: Village Milk Collection Desk
1. **Station Power-Up:** Ensure digital platform scale and Lactoscan MCC analyzer are powered and connected via USB/RS232.
2. **Farmer Identification:** Select or search the farmer by Code (`FARM-001`) or name.
3. **Weighment & Ingestion:**
   * Place milk can on scale (gross weight auto-deducts 1.2kg tare weight).
   * Aspirate milk sample into Lactoscan nozzle. Press `MEASURE`.
   * Lactoscan streams Fat %, SNF %, and Temperature directly into DairyOS.
4. **System Computation:** The system dynamically computes the per-litre rate:
   $$\text{Rate} = \text{Base Rate} + (\text{Fat} - 4.0) \times 4.50 + (\text{SNF} - 8.5) \times 2.50$$
5. **Confirmation & Receipt:** Click **"Commit Collection Batch"**. 
   * Destination Chilling Vat B is automatically credited with the inwards volume.
   * A 58mm/80mm thermal receipt slip is generated.
   * If Twilio/WhatsApp is configured, an SMS receipt is dispatched to the farmer's registered mobile number.

### SOP-02: Quality Lab & FSSAI Form E Tanker Clearance
1. **Tanker Arrival:** Bulk milk reefer tanker arrives at the plant intake dock.
2. **Quality Lab Testing:**
   * Lab technician performs Gerber Fat test, Lactometer reading (CLR), MBRT dye reduction test, and chemical adulteration tests (Starch, Urea, Detergent, Neutralizers).
3. **Clearance Decision:** Open the **Quality Testing** module, locate the tanker consignment, and open **FSSAI Tanker Lab Clearance Certificate (Form E)**.
4. **Authorization:** Confirm all parameters meet FSSAI Table 1 standards (Fat $\ge$ 4.5%, SNF $\ge$ 8.5%, Temp $\le$ 4.0°C). Click **"Certify & Authorize Silo Intake"** and download the signed vector PDF certificate.

### SOP-03: Cold Chain Silo Management & Glycol Telemetry
1. **Live Temperature Monitoring:** Access **Chilling Centre & Bulk Milk Pool**. Verify all 4 silos (Vats A, B, C, D) are maintained between $2.0^\circ\text{C}$ and $4.0^\circ\text{C}$.
2. **High Temperature Alert:** If temperature exceeds $4.5^\circ\text{C}$, the system triggers an audible and visual notification and recommends increasing glycol flow.
3. **Inter-Silo Milk Transfers:** Click **"Inter-Tank Milk Transfer"**, select Source and Destination tanks, specify volume in litres, and confirm. The mass balance engine automatically updates volume and mass balance ledgers.

### SOP-04: Dairy Processing & Dynamic BOM Formulation
1. **Batch Planning:** Open **Dairy Processing Plant**.
2. **Launch Processing Batch:** Click **"Launch Processing Batch"**, select target SKU (e.g., *Full Cream Gold Milk 1L Pouch*, *Toned Fresh Milk*, *Cow Ghee*, *Malai Paneer*), and enter raw milk allocation (e.g., 1,500 L).
3. **BOM Allocation:** The system verifies raw milk availability from Silo A/B, deducts inventory, commits packaging pouches, and computes processing utilities cost.
4. **Batch Execution:** Monitor pasteurization temperature ($72^\circ\text{C}$ for 15 seconds) and record final yield units.

### SOP-05: Commercial Sales & 3-Ply GST Tax Invoicing
1. **Order Booking:** Under **Sales Orders & Revenue Operations**, click **"Create Sales Order"**.
2. **Customer & SKU Details:** Enter buyer details (e.g., *Amul Parlour Anand*, *Metro Cash & Carry*), select product SKU, unit rate, and quantity.
3. **GST Computation:** The GST engine automatically calculates CGST (2.5%) and SGST (2.5%) for 5% dairy categories, or standard GST for processed goods.
4. **Invoice Issuance:** Click **"GST Invoice"** to inspect the official 3-Ply document:
   * **Original (Recipient Copy):** Blue title header for buyer account.
   * **Duplicate (Transporter Copy):** Green title header for driver and E-Way bill inspection.
   * **Triplicate (Supplier Copy):** Amber title header for cooperative finance books.
5. **Vector PDF Export:** Click **"Download Vector PDF"** to export an official high-resolution document.

### SOP-06: Batch Farmer Banking Disbursement (IMPS/UPI)
1. **Payables Reconciliation:** Under **Payments & Settlement Ledger**, inspect the total gross payable, previously disbursed amount, and net pending clearance.
2. **Batch Banking Release:** Click **"Disburse All Pending (IMPS)"**.
3. **Gateway Settlement:** The system aggregates unpaid collections by farmer, verifies bank account IFSC codes, issues simulated IMPS payment references, and logs transactions to the permanent audit trail.

---

## 4. Hardware Peripheral Setup & Integration Guide

### Milkotronic Lactoscan MCC Serial Bridge
* **Interface:** RS232 DB9 to USB FTDI Chipset.
* **Baud Rate:** `9600 bps` (Data bits: 8, Stop bits: 1, Parity: None, Flow Control: None).
* **Protocol Output:** Standard 4-byte ASCII comma-delimited sentence:
  ```text
  $LACTO,FAT:4.52,SNF:8.71,DENS:28.4,TEMP:4.2*checksum
  ```
* **Endpoint Ingestion:** Streams directly to `POST /api/v1/iot/lactoscan`.

### Digital Load-Cell Weighing Platform
* **Interface:** RS232 / USB Virtual COM Port.
* **Continuous Streaming Mode:** Streams `W:+0045.20KG` at 10Hz.
* **Tare Handling:** Automated tare weight subtraction (default: 1.20 kg aluminum can weight).

### POS Thermal Slip Printers
* **Supported Models:** Epson TM-T82, TVS RP-3200 Star, POS-58 USB/Bluetooth.
* **Command Set:** Standard ESC/POS (`ESC @`, `GS V 66 0`).
* **Paper Width:** Switchable between 58mm (collection centers) and 80mm (plant weighbridges).

---

## 5. Deployment & Production Operations Runbook

### Option A: Local Enterprise Workstation (Windows / Linux)
```powershell
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Synchronize database and seed master records
npx prisma db push
npm run seed

# 3. Build optimized frontend production bundle
npm run build

# 4. Launch both Backend API (port 5000) and Frontend (port 3000)
npm run dev:all
```

### Option B: High-Availability Docker Compose Cloud Stack
```bash
# 1. Launch complete stack (Postgres 16, Redis 7, Node API, Nginx Reverse Proxy)
docker compose up -d --build

# 2. Verify container health status
docker compose ps

# 3. View live server logs
docker compose logs -f api
```

### Option C: Production Preflight Check
Before commissioning to users, execute the preflight check:
```bash
npm run launch:check
```
*Expected Output:* `14 / 14 Checks Passed — CLEARED FOR ENTERPRISE LAUNCH!`

---

## 6. Disaster Recovery & Database Maintenance

1. **Daily SQLite Backup (Local Mode):**
   ```powershell
   Copy-Item dev.db -Destination "C:\Backups\dairyos_backup_$(Get-Date -Format 'yyyyMMdd_HHmm').db"
   ```
2. **PostgreSQL Automated Dump (Docker Cloud Mode):**
   ```bash
   docker exec -t dairyos_postgres pg_dump -U dairy_admin dairyos_prod > /var/backups/dairyos_$(date +%F).sql
   ```
3. **Database Restore:**
   ```bash
   cat /var/backups/dairyos_backup.sql | docker exec -i dairyos_postgres psql -U dairy_admin -d dairyos_prod
---

## 7. GitHub Data Repository, Calendar Filters & Entity Deep Linking Guide

### 7.1 Accessing Backend Data on GitHub
The repository now directly tracks and maintains both binary and human-readable backend data on GitHub:
* **Repository Link**: [https://github.com/pandeyastha640/ERP_DAIRY](https://github.com/pandeyastha640/ERP_DAIRY)
* **Live Pre-Loaded Database**: `prisma/dev.db` (Pre-seeded with 33 registered farmers, 53 cattle records, 50 milk collections, 4 silos, and 19 sales orders).
* **Human-Readable JSON Snapshot**: `prisma/data_dump.json` (5,600+ lines of formatted JSON data queryable directly on GitHub).
* **Syncing Local Database to GitHub**:
  ```bash
  npm run db:export
  git add prisma/dev.db prisma/data_dump.json
  git commit -m "chore(data): sync latest milk operations database"
  git push origin main
  ```

### 7.2 Interactive Calendar Date Filters & 3D Volumetric Charts
* **3D Isometric Bar Charts**: Rendered with specular top caps and shadow geometry to distinguish Own Herd milking from Farmer Procurement.
* **3D Area Trend Ribbons**: Luminous glowing curve with spherical node highlights.
* **Date-Range Slicers (`<input type="date">`)**: Click the calendar icon on Milk Operations or Sales Orders to select custom Start and End dates, or use quick presets (`7D`, `14D`, `30D`).

### 7.3 Omnidirectional Entity Deep Linking ("Click Anything to Jump")
* **Mass Balance Formula Cards**: Clicking any of the 7 balance nodes (+Own Production, +Farmer Milk, -Quality Rejection, -Processing HTST) navigates directly to the originating module.
* **Silo Actions**: Silo tank cards feature *"Route to Line &rarr;"* and *"Boost 3.8°C"* chiller telemetry buttons.
* **Order Book**: Customer names jump to Distribution, product names jump to SKU Catalog, totals jump to Finance, and payment badges jump to Accounts.

---

*Certified for Organizational Deployment by DairyOS Engineering Team.*
