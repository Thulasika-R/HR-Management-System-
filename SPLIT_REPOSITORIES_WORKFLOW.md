# HR-Management-System- — 2-Repository Split & GitHub Deployment Guide

This guide details the complete, step-by-step workflow for splitting **`Thulasika-R/HR-Management-System-.git`** into two dedicated, independent repositories for both team members on GitHub while preserving commit history, enabling standalone execution, and linking them together.

---

## 🏗️ 1. Architecture & Repository Naming Strategy

To maintain clear traceability and professional portfolio presentation:

```text
Original Monorepo:
https://github.com/Thulasika-R/HR-Management-System-

                     │
          ┌──────────┴──────────┐
          ▼                     ▼
[ Target Repository 1 ]       [ Target Repository 2 ]
Owner: Thulasika-R            Owner: Rudhran2007
Repo:  HR-Management-System-Frontend  Repo:  HR-Management-System-Backend
```

| Component | Target GitHub Account | Repository Name Suggestion | Core Scope |
|---|---|---|---|
| **Frontend SPA** | [`https://github.com/Thulasika-R`](https://github.com/Thulasika-R) | `HR-Management-System-Frontend` | Glassmorphic UI, Employee Cards, Attendance Widget, 10 Leave Request Portals, Printable Payslips, Role Landing Page |
| **Backend API & State Engines** | [`https://github.com/Rudhran2007`](https://github.com/Rudhran2007) | `HR-Management-System-Backend` | Express REST APIs, JWT Auth, RBAC Security Guards, Payable-Day Calculation Engine, Salary Service, Atomic Leave Propagation |

---

## 🛠️ 2. Step-by-Step Splitting & Pushing Workflow

### Step 2.1: Clone and Prepare the Working Directory
Open your terminal (PowerShell or Bash) on your computer:

```bash
# 1. Navigate to your projects directory
cd C:\Users\rudhr\Downloads

# 2. Clone the original main repository (or use the existing folder)
git clone https://github.com/Thulasika-R/HR-Management-System-.git hrms-split-workspace
cd hrms-split-workspace
```

---

### Step 2.2: Split Method — Git Subtree (Preserves Commit History)

Git's built-in `git subtree split` extracts a specific folder into its own isolated branch containing only the commits relevant to those files.

#### Part 1: Extract Backend for `Rudhran2007`
```bash
# 1. Create a dedicated backend history branch from the server/ directory
git subtree split --prefix=server -b split-backend

# 2. Create a new directory for the backend repository
mkdir ..\HR-Management-System-Backend
cd ..\HR-Management-System-Backend
git init
git pull ..\hrms-split-workspace split-backend

# 3. Add root package.json and backend documentation
# (Copy server dependencies and create dedicated README.md)
git add .
git commit -m "chore(release): initialize standalone backend engine repository"

# 4. Configure remote and push to Rudhran2007's GitHub account
git remote add origin https://github.com/Rudhran2007/HR-Management-System-Backend.git
git branch -M main
git push -u origin main
```

---

#### Part 2: Extract Frontend for `Thulasika-R`
```bash
# 1. Return to the split workspace
cd ..\hrms-split-workspace

# 2. Create a dedicated frontend history branch from the public/ directory
git subtree split --prefix=public -b split-frontend

# 3. Create a new directory for the frontend repository
mkdir ..\HR-Management-System-Frontend
cd ..\HR-Management-System-Frontend
git init
git pull ..\hrms-split-workspace split-frontend

# 4. Add root frontend package.json / web configs and create dedicated README.md
git add .
git commit -m "chore(release): initialize standalone frontend client repository"

# 5. Configure remote and push to Thulasika-R's GitHub account
git remote add origin https://github.com/Thulasika-R/HR-Management-System-Frontend.git
git branch -M main
git push -u origin main
```

---

## 🔗 3. Linking the Two Repositories

### Option A: Cross-Referencing in README (Recommended for Hackathons)
In both split repositories, add a prominent header linking to each other and the original monorepo:

#### In `HR-Management-System-Backend` (Rudhran2007):
```markdown
# Dayflow HRMS — Backend & State Engine API
- **Frontend Client Repository**: [Thulasika-R/HR-Management-System-Frontend](https://github.com/Thulasika-R/HR-Management-System-Frontend)
- **Original Monorepo**: [Thulasika-R/HR-Management-System-](https://github.com/Thulasika-R/HR-Management-System-)
```

#### In `HR-Management-System-Frontend` (Thulasika-R):
```markdown
# Dayflow HRMS — Glassmorphic Frontend Client
- **Backend API Engine Repository**: [Rudhran2007/HR-Management-System-Backend](https://github.com/Rudhran2007/HR-Management-System-Backend)
- **Original Monorepo**: [Thulasika-R/HR-Management-System-](https://github.com/Thulasika-R/HR-Management-System-)
```

---

### Option B: Git Submodules in the Main Repository
To keep the main monorepo `Thulasika-R/HR-Management-System-` updated with both sub-projects:

```bash
cd ..\hrms-split-workspace

# Add both split repositories as submodules
git submodule add https://github.com/Thulasika-R/HR-Management-System-Frontend.git client
git submodule add https://github.com/Rudhran2007/HR-Management-System-Backend.git server

git commit -m "chore: link frontend and backend submodules from individual team repositories"
git push origin main
```

---

## 🧪 4. Independent Verification & Testing Checklist

| Test Item | Backend Repo (`Rudhran2007`) | Frontend Repo (`Thulasika-R`) |
|---|---|---|
| **Independent Start** | `npm install && npm start` (Boots REST server on port 5000) | Opens `index.html` or runs with `npx serve` on port 3000 |
| **CORS & Connection** | Configured to accept requests from frontend origins | Configured in `api.js` to point to `http://localhost:5000/api` |
| **Commit History** | Displays commits made by Backend Lead | Displays commits made by Frontend Lead |
| **Live Endpoints** | `GET /api/health`, `GET /api/employees`, `POST /api/timeoff/action` | Dashboard cards, Check-in widget, 10 Leave types, Payslips |
