# 🧭 DairyOS — Developer Technical Handover & Future Roadmap

> **Welcome to the DairyOS Engineering Team!**  
> This document is the definitive technical onboarding and future direction manual for any software engineer, tech lead, or developer taking over or contributing to this repository.  
> It explains **how the system is built**, **where the project stands today**, and **exact priorities of what to build next**.

---

## 📌 Executive Tech Stack Summary

* **Frontend:** React 19, TypeScript 5.0+, Tailwind CSS 4, Vite 8, Lucide React Icons.
* **Backend:** Node.js 20+, Express 4, TypeScript (`tsx` execution engine).
* **Database & ORM:** SQLite (`prisma/dev.db`) via Prisma ORM 6.19 (PostgreSQL-compatible).
* **AI Engine:** Google Gemini AI integration (`@google/genai`).
* **Deployment & Containerization:** Docker, Docker Compose, Nginx, Render / Vercel ready.
* **Testing:** Custom end-to-end subsystem test suite (`tsx scripts/verify_all_phases.ts` — 39 tests).

---

## 📍 1. Where the Project Stands Today (Completed Foundation)

DairyOS is **not** a prototype or mockup. It is a fully functional, mathematically sound, production-level Dairy ERP with 20 active modules:

1. **Central Control Tower & 3D Analytics (Tabs 00 & 01):**
   * Real-time milk flow pipeline (*Farmer Inward &rarr; Silo Chilling &rarr; HTST Processing &rarr; Finished Goods &rarr; Distribution &rarr; Commercial Sales*).
   * 3D volumetric isometric charts (`BarComparisonChart`, `AreaTrendChart`) with faceted depth and specular sheen.
   * Interactive HTML5 Calendar date-range slicers (`<input type="date">`) slicing live timelines.
2. **Closed-Loop Mass Balance Reconciliation Engine (Tab 05):**
   * Zero-loss mass balance: $\text{Opening} + \text{Own} + \text{Farmer} - \text{QC Rejections} - \text{Processing} - \text{Loss} = \text{Closing Silo Balance}$.
   * Omnidirectional entity deep linking ("click anything to jump" across formulas, cards, and tables).
3. **2-Axis Milk Pricing & Intake (Tab 03):**
   * Dynamic Fat/SNF pricing formula with automatic deductions for low quality or water dilution.
   * ESC/POS thermal receipt slip generator (58mm/80mm format).
4. **GST 3-Ply Commercial Billing (Tab 09):**
   * Commercial invoices with HSN codes (`0401`, `0405`, `0406`), CGST/SGST splitting, and vector PDF printing.
5. **Batch Banking IMPS Disbursement Engine (Tab 15):**
   * Automated payout calculations, pending payables ledger, and corporate NEFT/IMPS clearing simulations.
6. **Pre-Seeded Database on GitHub:**
   * Both `prisma/dev.db` (SQLite binary) and `prisma/data_dump.json` (5,600+ lines of data) are committed and tracked on GitHub.

---

## 🎯 2. In Which Direction You Need to Work Next (Prioritized Developer Backlog)

If you are taking over development, here is your prioritized technical roadmap broken into 4 strategic tracks:

### 🚀 Track 1: Cloud Database Migration (Highest Priority)
* **Current State:** The system runs on local SQLite (`prisma/dev.db`).
* **Your Task:** Switch the database to hosted **PostgreSQL** (e.g., Supabase, Neon, AWS RDS, or Render PostgreSQL) so multiple users across different laptops and smartphones share the exact same live database in real-time.
* **How to do it:**
  1. In [prisma/schema.prisma](prisma/schema.prisma), change `provider = "sqlite"` to `provider = "postgresql"`.
  2. In [.env](.env), update `DATABASE_URL` with your cloud PostgreSQL connection string:
     ```env
     DATABASE_URL="postgresql://user:password@db.supabase.co:5432/dairyos?sslmode=require"
     ```
  3. Run:
     ```bash
     npx prisma db push
     npm run seed
     ```

### 💳 Track 2: Live Banking & SMS Gateway Keys
* **Current State:** Banking payouts (IMPS) and farmer receipts (SMS/WhatsApp) run through a resilient simulation engine that generates valid transaction reference IDs and bilingual delivery payloads.
* **Your Task:** Plug in real third-party API credentials:
  1. **Banking Payouts:** In `server/src/routes/payments.ts`, connect real **RazorpayX** or **Cashfree Payouts API** keys (`RAZORPAYX_KEY_ID`, `RAZORPAYX_KEY_SECRET`).
  2. **Farmer WhatsApp/SMS:** In `server/src/routes/notifications.ts`, provide production credentials for **Twilio**, **Gupshup**, or the **Meta WhatsApp Cloud API**.
  3. **Google Gemini AI:** Set `GEMINI_API_KEY` in `.env` to enable real-time live LLM inference instead of the offline heuristic fallback engine.

### 🔌 Track 3: Physical Village Hardware Bridge (Lactoscan & Scales)
* **Current State:** The Web Serial API bridge in `src/pages/MilkCollectionPage.tsx` and `server/src/routes/iot.ts` is architected to parse RS232 strings.
* **Your Task:** Connect physical hardware in testing:
  1. Plug in a **Milkotronic Lactoscan MCC** or **Ekomilk Ultra** via USB-to-RS232 adapter.
  2. Use Chrome's `navigator.serial.requestPort()` at 9600 baud rate to verify continuous data streaming from physical milk samples.
  3. Test physical **Epson TM-T82** or **TVS RP-3200 Star** thermal printers via USB/Bluetooth.

### 🌐 Track 4: Multi-Language Localization (i18n for Farmers)
* **Current State:** The web application is in English with bilingual Hindi/English thermal slips.
* **Your Task:** Implement `react-i18next` across the UI:
  1. Provide language toggles for **Hindi (हिन्दी)**, **Gujarati (ગુજરાતી)**, **Marathi (मराठी)**, and **Punjabi (ਪੰਜਾਬੀ)**.
  2. Prioritize translating **Tab 03 (Milk Collection Desk)** and **Tab 15 (Farmer Passbook)** so rural village operators and cooperative farmers can use the interface in their native tongue.

### 📱 Track 5: Native Android App Packaging (PWA &rarr; APK)
* **Current State:** The app is a Progressive Web App (PWA) with offline caching (`sw.js`) and mobile field view (`MobileFieldView.tsx`).
* **Your Task:** Use **Capacitor** to build a standalone Android APK:
  ```bash
  npm install @capacitor/core @capacitor/cli @capacitor/android
  npx cap init DairyOS com.dairyos.enterprise
  npm run build
  npx cap add android
  npx cap open android
  ```
  This enables milk collection agents in remote villages to download DairyOS directly from the Google Play Store or distribute APKs internally.

---

## 🏛️ 3. Core Architecture Rules (DO NOT BREAK THESE)

When writing code in this repository, follow these cardinal engineering rules:

1. **Never Replace Real Calculations with Mock Demos:**  
   The mass balance equation, the 2-axis pricing formula ($\text{Rate} = \text{Base} + (\text{Fat}-4.0)\times 4.50 + (\text{SNF}-8.5)\times 2.50$), and unit economics must always calculate dynamically from actual data.
2. **Two-Way State Synchronization:**  
   Whenever adding a new action or form, update the local React Context ([DairyERPContext.tsx](src/context/DairyERPContext.tsx)) AND dispatch the corresponding REST request to the backend API ([src/services/api.ts](src/services/api.ts)).
3. **Preserve Clickable Entity Deep Linking:**  
   When rendering entity names (farmers, cattle tags, silos, batches, orders), always provide clickable links using `setCurrentModule(moduleId)` and `setSelectedItemId(id)` so users can jump seamlessly between pages.
4. **Maintain the Dairy Visual System:**  
   Use the established palette:
   * Forest Green: `#1b4332` (Primary Brand & Navigation)
   * Soft Sage: `#52b788` / `#f0f7f2` (Accents, Status Pills)
   * Warm Cream: `#faf8f5` / `#fdfcfb` (Backgrounds & Panels)
   * Warm Gold: `#c59b27` / `#fef9c3` (Financial Highlights)
5. **Always Keep Automated Phase Tests Green:**  
   Before opening a Pull Request or committing changes, run:
   ```bash
   npm run lint
   npm run test:phases
   ```
   All 39 subsystems must report `[✅ PASS]`.

---

## ⚡ 4. Developer Day-1 Quickstart Checklist

To start developing immediately on your machine:

```bash
# 1. Clone repository
git clone https://github.com/pandeyastha640/ERP_DAIRY.git
cd ERP_DAIRY

# 2. Install all node packages
npm install

# 3. Verify TypeScript compiles with zero errors
npm run lint

# 4. Run the 39-subsystem test suite
npm run test:phases

# 5. Launch both Backend (:5000) and Frontend (:3000) concurrently
npm run dev:all
```

* Frontend application: 👉 **`http://localhost:3000`**
* Backend API health: 👉 **`http://localhost:5000/ready`**
* Prisma Studio GUI: 👉 **`npm run studio`** &rarr; **`http://localhost:5555`**
* Export latest database dump: 👉 **`npm run db:export`**

---

## 📁 5. Key File Mapping (Where to Edit What)

| If you want to change / add... | Edit this file: |
| :--- | :--- |
| **New Database Table / Field** | `prisma/schema.prisma` &rarr; run `npx prisma db push` |
| **New Backend API Route** | `server/src/routes/` & register in `server/src/index.ts` |
| **Global App State & Calculations**| `src/context/DairyERPContext.tsx` |
| **API Client Calls** | `src/services/api.ts` |
| **Sidebar Navigation / New Tabs** | `src/components/layout/Sidebar.tsx` & `src/App.tsx` |
| **3D Charts & Visualizations** | `src/components/charts/Charts.tsx` |
| **Milk Operations & Shift Logic** | `src/pages/MilkOperationsPage.tsx` |
| **Lactoscan & Intake Logic** | `src/pages/MilkCollectionPage.tsx` |
| **Cold Silos & Mass Balance** | `src/pages/ChillingMilkPoolPage.tsx` |
| **HTST Pasteurizer & Yield** | `src/pages/ProcessingPage.tsx` |
| **Commercial Orders & Invoicing**| `src/pages/SalesPage.tsx` |
| **Automated Test Assertions** | `scripts/verify_all_phases.ts` |

---

*This guide was generated for seamless engineering handover. Happy coding!* 🥛
