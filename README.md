# 🥛 DairyOS — Enterprise Dairy Management & Cooperative ERP Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748.svg)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

**DairyOS** is an all-in-one, production-grade enterprise Dairy ERP designed for dairy plants, chilling centers, and milk producer cooperatives. It combines modern UI/UX design with closed-loop volumetric mass-balance accounting, hardware IoT cold-chain telemetry, ultrasonic Lactoscan milk testing, GST 3-ply compliant commercial billing, and automated IMPS banking disbursements.

---

## 🌐 Quick Access on GitHub

* **Repository URL**: [https://github.com/pandeyastha640/ERP_DAIRY](https://github.com/pandeyastha640/ERP_DAIRY)
* **Default Branch**: `main`
* **Pre-Loaded Data**: Comes pre-packaged with full SQLite database ([prisma/dev.db](prisma/dev.db)) and human-readable export dump ([prisma/data_dump.json](prisma/data_dump.json)) containing 33 registered farmers, 53 cattle records, 50 milk collections, 4 silos, and 19 sales orders.
* **Direct Clone Command**:
  ```bash
  git clone https://github.com/pandeyastha640/ERP_DAIRY.git
  ```

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
* **Node.js** &ge; 18.x
* **npm** &ge; 9.x
* **Git**

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/pandeyastha640/ERP_DAIRY.git
   cd ERP_DAIRY
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Initialize Database Schema & Seeds**:
   ```bash
   npx prisma db push
   ```

4. **Start the Platform**:
   * **Terminal 1 — Backend API Server** (Port 5000):
     ```bash
     npm run server
     ```
   * **Terminal 2 — Frontend UI Application** (Port 3000):
     ```bash
     npm run dev
     ```

5. **Open in Browser**:
   * **Frontend UI Application**: 👉 **[http://localhost:3000](http://localhost:3000)**
   * **Backend API Health Check**: 👉 **[http://localhost:5000/ready](http://localhost:5000/ready)**
   * **Prisma Database Visual GUI**:
     ```bash
     npx prisma studio
     ```
     Access at: 👉 **[http://localhost:5555](http://localhost:5555)**

---

## 🐳 Docker Deployment (Single Command)

Run the entire platform (Frontend + Backend + SQLite Database) in isolated containers:

```bash
docker compose up --build -d
```
* Web Application: `http://localhost:3000`
* API Gateway: `http://localhost:5000`

---

## ☁️ 1-Click Cloud Deployment for Organizations

You can deploy DairyOS directly from GitHub to free or production cloud providers:

### Option A: Render.com (Recommended for Full-Stack)
1. Fork or open the repo: `pandeyastha640/ERP_DAIRY`.
2. On [Render.com](https://render.com), click **New Web Service** &rarr; Select your GitHub repo.
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npm run server`
5. Render generates a public HTTPS URL (e.g. `https://dairyos.onrender.com`) that anyone in your organization can use immediately on their mobile, tablet, or desktop.

### Option B: Vercel / Netlify (Frontend) + Railway (Backend)
* Deploy the React frontend via Vercel: Connect GitHub &rarr; Select root directory &rarr; Deploy.
* Deploy the Node backend via Railway / Render: Connect GitHub &rarr; Start `npm run server`.

---

## 📊 Modules & Enterprise Capabilities

| Module | Route / Tab | Key Features |
| :--- | :--- | :--- |
| **Control Tower & Dashboard** | `Tab 00: Overview` | Executive KPI ribbon, 3D volumetric charts, milk-flow pipeline, unit economics |
| **Milk Operations** | `Tab 01: Operations` | Daily shift consolidation, calendar date filters, mass-balance audit, stream comparison |
| **Cattle Herd Management** | `Tab 02: Cattle` | Ear-tag lifecycle registry, daily parlour yield logging, lactation curves, pedigree lineage |
| **Milk Collection & Intake** | `Tab 03: Collection` | Digital Lactoscan intake, Fat/SNF two-axis pricing, 58/80mm POS thermal slip printing |
| **Quality & Lab Testing** | `Tab 04: Quality` | FSSAI ISO 22000 adulteration strips, MBRT, alcohol COB, Bulk Tanker Lab Certificates |
| **Chilling & Bulk Milk Pool** | `Tab 05: Chilling` | 4 insulated silos, IoT temperature sensors, glycol chiller boost, zero-loss mass balance |
| **Processing & Pasteurization**| `Tab 06: Processing` | HTST continuous 72°C/15s runs, cream separation, yield standardization, recipe BOMs |
| **Products & Inventory** | `Tab 07 & 08` | SKU catalog, warehouse cold-storage tracking, batch expiry alerts |
| **Commercial Sales & Orders** | `Tab 09: Sales` | Multi-channel order book, GST 3-ply invoices, calendar filter, dispatch pass |
| **Route Logistics & Fleet** | `Tab 10: Distribution`| Reefer van dispatch, crate balancing, driver route tracking, delivery gate passes |
| **Cooperative Federation** | `Tab 11: Federation` | Village primary milk societies (VDCS) & District Milk Union federation hierarchy |
| **Finance, Accounts & IMPS** | `Tab 15 & 16` | Farmer passbooks, batch IMPS banking disbursements, COGS, SKU contribution margins |
| **AI Operations Intelligence** | `Tab 18: AI Brain` | 72-hour neural procurement forecast, least-cost feed balancer, anomaly auditor |

---

## 🔒 Security & Enterprise Compliance

* **FSSAI Food Safety Standards**: Strict adulteration test controls, MBRT bacterial limits, and cold-chain logging (&le; 4.5°C).
* **GST India Statutory Compliance**: 3-ply commercial tax invoices with HSN codes (`0401`, `0405`, `0406`), CGST/SGST splits, and E-Way bill thresholding.
* **Audit Trail Ledger**: Cryptographically hashed immutable event logging across all financial and volume entries.
* **OWASP Hardened**: Helmet HTTP security headers, CORS origin protection, input sanitization, and SQL injection prevention via Prisma ORM.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
