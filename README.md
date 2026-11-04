# SANMATI CONSTRUCTIONS ERP SYSTEM
### Cloud-Based Enterprise Resource Planning for Construction Management
**Location:** Kolhapur, Maharashtra, India  
**Company:** SANMATI CONSTRUCTIONS  
**GSTIN:** `27AAYCS9281Q1ZU` | **PAN:** `AAYCS9281Q`

---

## 🏗️ 1. Project Overview

**SANMATI CONSTRUCTIONS ERP** is a full-stack, cloud-ready commercial ERP system designed specifically for civil contracting and infrastructure companies in Maharashtra, India. It manages multi-site construction operations, client relations, subcontractors, material inventory, Running Account (RA) billing, GPS geofencing attendance, Tally ERP integration, and multi-tier approval workflows.

---

## 🛠️ 2. Technology Stack

- **Frontend:**
  - React.js (JavaScript, v18.3.1)
  - Tailwind CSS (Deep charcoal `#12151a`, Champagne gold `#d4af37`, Copper `#b87333` theme)
  - React Router DOM (v6)
  - Lucide React (Enterprise iconography)
  - Recharts (Interactive BI charts, cashflow, budget variance)
  - Leaflet & React-Leaflet (Interactive GPS and Geofencing site maps)
  - jsPDF & jsPDF-AutoTable (Official RA bills, salary payslips, quotations, reports)
  - SheetJS (XLSX) & CSV export engines
- **Backend:**
  - Node.js & Express.js
  - Firebase Admin SDK
  - Tally XML Gateway Connector Service (ODBC/XML port 9000)
- **Database & Cloud:**
  - Firebase Firestore (NoSQL cloud collections with batched writes)
  - Firebase Authentication (RBAC enforcement)
  - Firebase Storage (Site photographs & construction documents)

---

## 👥 3. The 8 Operational User Roles

1. **Super Admin / Owner** (Sanmati Patil) – Full access to all 18 modules, financials, audit logs, and user provisioning.
2. **Project Manager** (Er. Rajesh Kulkarni) – Work Breakdown Structure (WBS), 10 construction activities, DPRs, subcontractor tracking, tender quotations.
3. **Site Engineer** (Er. Amit Deshmukh) – Mobile GPS check-in/out within site geofence, Daily Progress Reports (DPR), site photo uploads, material requests.
4. **Accountant** (CA Sneha Shinde) – General ledger, cashbook, RA billing, client receipts, vendor vouchers, GST compliance, and Tally synchronization.
5. **Purchase Manager** (Mahesh Yadav) – Material requests, purchase orders (POs), supplier quotations, vendor ratings.
6. **Storekeeper** (Ganesh Powar) – Central warehouse inventory, Goods Receipt Notes (GRN), stock inward/outward, and site issue movements.
7. **HR Manager** (Pooja Jadhav) – Staff directory, salary structures, attendance verification, payroll runs, and PDF payslip generation.
8. **Employee** (Suresh Bhosale) – Personal profile, GPS attendance check-in, leave requests, task updates, and monthly payslips.

---

## 📦 4. The 18 Functional Modules

| # | Module | Core Functionality |
|---|---|---|
| **1** | **CRM Management** | Client directory, lead categorization, project enquiries, and follow-up schedules. |
| **2** | **Account Management** | Cashbook, bank accounts (HDFC, SBI), financial ledger vouchers, debtors & creditors balances. |
| **3** | **Vendor Management** | Material supplier profiles, GSTIN verification, subcontractor contracts, and payment records. |
| **4** | **Tally Integration** | Tally XML Gateway connector, chart of accounts mapping, voucher synchronization, and XML download. |
| **5** | **Custom Reports** | Custom report builder with date, site, and category filters. PDF, Excel, and CSV export engines. |
| **6** | **HRMS & Payroll** | Staff database, designation salary structures (Basic, HRA, PF, PT), monthly payroll, and PDF payslips. |
| **7** | **Geotracking & Geofencing** | GPS check-in/out for authorized users, Haversine perimeter verification against site center, and Leaflet map. |
| **8** | **Quotation Management** | Civil quotation builder with BOQ cost breakdown (materials, labour, plant), profit margins, and GST. |
| **9** | **Tender Management** | PWD, KMC, MSRDC e-tenders, EMD tracking (1%), eligibility criteria, and bid quotation amounts. |
| **10** | **Construction Projects** | **Core Module:** WBS, 10 construction activities (Excavation to Handover), BOQs, DPRs, and profitability engine. |
| **11** | **Business Intelligence** | Recharts financial analytics, monthly billing vs expense cashflow, client concentration, and margin ranking. |
| **12** | **MIS Reports** | Management Information System reports for project execution, attendance, materials, and budgets with print support. |
| **13** | **Inventory Management** | Material master, stock balances, low stock alerts, Goods Receipt Notes (GRN), and site issue decrement. |
| **14** | **Expense Management** | Petty cash claims, site diesel/fuel vouchers, equipment maintenance, and employee reimbursements. |
| **15** | **Budget Management** | Sanctioned project budgets, WBS head-wise breakdown (materials 55%, labour 25%), and cost variance. |
| **16** | **Approval Management** | Configurable multi-tier workflow (Draft → Submitted → Approved / Rejected) with complete audit history. |
| **17** | **Role-Based Access** | 8-role security matrix, user account provisioning, and activation/deactivation toggles. |
| **18** | **GST & Taxation** | GSTIN compliance, intra-state CGST (9%) + SGST (9%) & inter-state IGST (18%), and tax invoice PDF export. |

---

## 🚀 5. Getting Started

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v10+

### Start the Servers

1. **Start the Node.js Express Backend** (Port 5000):
   ```bash
   cd server
   node server.js
   ```

2. **Start the React Vite Frontend** (Port 3000):
   ```bash
   cd client
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

4. Use the **One-Click Role Demonstration Buttons** on the Login screen (e.g. `👑 Super Admin`, `👷 Project Manager`, `📍 Site Engineer`, `💼 Accountant`) to test and evaluate any operational role instantly!
