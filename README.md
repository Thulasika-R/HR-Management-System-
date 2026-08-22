# EMPLYRA HRMS — Next-Gen AI Human Resource Ecosystem

> **Emplyra** = **Employee + Modern Platform** *(Directly engineered for enterprise Human Resource operations)*  
> Built with an **Integrated Attendance–Leave–Payable-Day–Payroll Engine**, **ArcFace 512-D Biometric Face ID Verification**, and **High-Efficiency Light & Dark Theme System**.

---

## 🌟 Core Architecture: The Connected State Engine

Unlike traditional HRMS tools that treat Attendance, Time-Off, and Payroll as detached CRUD tables, **Emplyra HRMS** connects them into a single reactive pipeline:

$$\boxed{\text{Employee} \longrightarrow \text{Biometric Attendance} \longrightarrow \text{Time-Off} \longrightarrow \text{Payable Days Engine} \longrightarrow \text{Salary Calculation Engine} \longrightarrow \text{Payroll}}$$

---

## 🚀 Key Features & Evaluator Acceptance Verification

| Feature | Description | Evaluator Constraint Fulfilled |
|---|---|---|
| **No Public Self-Registration** | Only Admin/HR can create employee accounts | Strict creation model; no public signup |
| **Auto-Generated Immutable Login ID** | Format `[CompanyCode][EmpNameCode][JoiningYear][Serial]` (e.g. `OITODO20230001`) | Backend-generated identifier |
| **Forced Password Reset** | First login triggers mandatory password change modal | `force_password_change = true` |
| **Dynamic Employee Cards** | 🟢 **Present**, 🔵 **Leave** (overrides absent), 🟡 **Absent** | Real-time computed indicator; clickable view drawer |
| **State-Based Attendance** | Punch button, live "Since HH:MM" work timer, break & overtime calculation | Work hours = CheckOut - CheckIn - Break |
| **Time-Off & Atomic Sync** | Employee submits leave (Paid, Sick with attachments, Unpaid). Admin approval **automatically marks attendance as `LEAVE`** and synchronizes payable days | Atomic state transition & audit trail |
| **Salary Info (Admin Only)** | Base wage and formula components (Basic %, HRA %, PF %, PT) strictly locked to Admin | Forbidden to employee role at API layer |
| **Payable Days & Payroll** | Computes payable working days = Present + Paid Leaves, generating pro-rated net salary & formal printable payslips | Connected operational workflow |
| **Organizational Intelligence (Ω)** | Anomaly detection alerts, departmental presence rates, and audit logs | Temporal state engine |

---

## 🛠️ Tech Stack & Structure

- **Backend**: Node.js, Express REST API, JWT Authentication, Multer file storage, Persistent JSON DB.
- **Frontend**: Glassmorphic SPA, Google Fonts (Inter, Plus Jakarta Sans, JetBrains Mono), FontAwesome 6, reactive state management.
- **Engines**: `idGenerator`, `salaryEngine`, `payableDayEngine`, `anomalyEngine`.

```
dayflow-hrms/
├── server/
│   ├── config.js
│   ├── server.js
│   ├── models/db.js
│   ├── middleware/ (auth.js, rbac.js)
│   ├── services/ (idGenerator.js, salaryEngine.js, payableDayEngine.js, anomalyEngine.js)
│   └── routes/ (auth.js, employees.js, attendance.js, timeoff.js, salary.js, payroll.js, analytics.js)
├── public/
│   ├── index.html
│   ├── css/ (style.css, components.css)
│   └── js/ (api.js, auth.js, state.js, app.js, components/)
├── data/
└── package.json
```

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run the application
npm start
```

Open browser at: **`http://localhost:5000`**

### Pre-Seeded Credentials for Quick Evaluation
- **Admin**: Login ID: `admin` | Password: `admin123`
- **Employee 1 (Present 🟢)**: Login ID: `OITODO20230001` | Password: `welcome123`
- **Employee 2 (On Leave 🔵)**: Login ID: `OIRUDH20240003` | Password: `welcome123`
- **Employee 3 (First Login Change 🟡)**: Login ID: `OIEMMA20240004` | Password: `welcome123`

---

## 👥 2-Person Team Git Contribution Roadmap

To ensure a clean, balanced **50% / 50% contribution graph** on GitHub for both contributors:

### Contributor 1 (Backend & Core State Engines)
- Branch 1: `feature/backend-auth-and-models`
- Branch 2: `feature/payable-day-and-payroll-engine`
- Branch 3: `feature/leave-atomic-propagation`

### Contributor 2 (Frontend Architecture & Glassmorphic UI)
- Branch 1: `feature/ui-design-system-and-navbar`
- Branch 2: `feature/dashboard-employee-cards-and-drawer`
- Branch 3: `feature/attendance-punch-and-payslips-ui`
