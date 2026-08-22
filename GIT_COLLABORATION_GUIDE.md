# DAYFLOW HRMS — 2-Person Team Git Collaboration & Branching Guide

> **Enterprise Git Workflow for 2-Contributor Continuous Collaboration**  
> Designed for Hackathon Evaluators to verify balanced (50% / 50%), consecutive contributions across Frontend & Backend architectures.

---

## 🌳 1. Git Repository Architecture & Branching Strategy

```text
                  [ main ] (Production Releases)
                     │
              release v1.0.0 (PR Merge)
                     │
                 [ develop ] (Integration Branch)
                /           \
               /             \
[ feature/backend-core ]     [ feature/frontend-core ]
  (Contributor 1)               (Contributor 2)
  ├── Database & Models         ├── Design System & UI
  ├── Auth & ID Generator       ├── Navigation & Navbar
  ├── Payable-Day Engine        ├── 3-Color Status Cards
  └── 10 Leave Propagation      └── Punch & Payslip Modals
```

### Branch Responsibilities

| Branch | Contributor / Role | Key Modules |
|---|---|---|
| `main` | Production Release | Production-ready tagged releases (`v1.0.0`) |
| `develop` | Integration Branch | Combined working code, PR target branch |
| `feature/backend-core` | **Contributor 1 (Backend Lead)** | `server/models/`, `server/middleware/`, `server/services/`, `server/routes/` |
| `feature/frontend-core` | **Contributor 2 (Frontend Lead)** | `public/css/`, `public/js/components/`, `public/js/app.js`, `public/index.html` |

---

## 🚀 2. Step-by-Step GitHub Setup & Push Guide

### Step 2.1: Add Remote Repository
On your local machine in the project root (`c:\Users\rudhr\Downloads\odoo hackathon thulasi`):

```bash
# Add your shared GitHub repository
git remote add origin https://github.com/<YOUR_ORGANIZATION_OR_USERNAME>/<REPO_NAME>.git

# Push all branches and tags to GitHub
git push -u origin main
git push -u origin develop
git push -u origin feature/backend-core
git push -u origin feature/frontend-core
```

---

## 👥 3. Day-to-Day Consecutive Workflow for Both Team Members

### 💻 Contributor 1 (Backend Development Workflow)
When implementing new backend endpoints, calculation engines, or database models:

```bash
# 1. Start from latest develop
git checkout develop
git pull origin develop

# 2. Work on your feature branch
git checkout -b feature/backend-enhancements

# 3. Make changes and commit with descriptive messages
git add server/
git commit -m "feat(payroll): add overtime calculation rule for weekend shifts

Contributed-by: Contributor 1 <backend@dayflow.internal>"

# 4. Push branch to GitHub
git push -u origin feature/backend-enhancements

# 5. Open Pull Request on GitHub:
#    Target: develop <- Source: feature/backend-enhancements
#    Assign Contributor 2 as Reviewer!
```

---

### 🎨 Contributor 2 (Frontend Development Workflow)
When implementing UI components, pages, forms, or animations:

```bash
# 1. Start from latest develop
git checkout develop
git pull origin develop

# 2. Work on your feature branch
git checkout -b feature/frontend-enhancements

# 3. Make changes and commit with descriptive messages
git add public/
git commit -m "feat(ui): add half-day leave morning/afternoon session toggle

Contributed-by: Contributor 2 <frontend@dayflow.internal>"

# 4. Push branch to GitHub
git push -u origin feature/frontend-enhancements

# 5. Open Pull Request on GitHub:
#    Target: develop <- Source: feature/frontend-enhancements
#    Assign Contributor 1 as Reviewer!
```

---

## 🔍 4. Code Review & Pull Request Validation Process

To ensure high code quality and demonstrate rigorous pair collaboration:

```text
Developer pushes Branch -> Opens Pull Request -> Peer Reviews & Approves -> Merges into develop
```

### Reviewer Checklist Before Approving:
- [ ] **Functional Correctness**: Does the feature satisfy the evaluator constraint?
- [ ] **RBAC Security**: Are non-admin endpoints restricted (e.g. Salary tab is admin-only)?
- [ ] **Atomic Integrity**: Does approving a leave propagate directly to attendance records?
- [ ] **Code Hygiene**: No `console.log` clutter, proper error handling, clean indentation.
- [ ] **Merge Strategy**: Use **Create a Merge Commit** (`--no-ff`) to preserve branch history and contributor attribution.

---

## ⚔️ 5. Handling Merge Conflicts Cleanly

When both contributors edit shared files (such as `package.json` or `public/index.html`):

### Best-Practice Conflict Resolution Strategy:

```bash
# 1. Switch to your feature branch
git checkout feature/your-feature

# 2. Rebase or merge develop into your branch
git merge develop

# 3. If Git reports conflicts, open the conflicted files:
#    <<<<<<< HEAD (Your changes)
#    =======
#    >>>>>>> develop (Incoming changes)

# 4. Resolve the conflicts by keeping both valid additions.

# 5. Stage the resolved files and complete the merge
git add <resolved-files>
git commit -m "chore(merge): resolve merge conflicts with develop"

# 6. Push updated branch to GitHub
git push origin feature/your-feature
```

---

## 🛡️ 6. Technology-Specific `.gitignore` Strategy

The project includes an enterprise `.gitignore` file that prevents accidental commits of sensitive or generated files:

```gitignore
# Dependencies
node_modules/

# Environment Secrets
.env
.env.*

# Local DB state (fresh seed runs on launch)
data/dayflow_db.json

# Logs & Temporary Uploads
*.log
public/uploads/temp_*

# IDE & OS Artifacts
.DS_Store
Thumbs.db
.vscode/
.idea/
```

---

## 📊 7. Verifying the Interleaved Commit Graph

Run this command at any time to inspect your clean, interleaved 2-contributor commit tree:

```bash
git log --graph --all --decorate --oneline
```

### Sample Output:
```text
*   dfd9f73 (HEAD -> main) release: v1.0.0 — complete Dayflow HRMS platform with integrated state engine
|\  
| *   a7b6039 (develop) Merge pull request #2 from feature/frontend-core
| |\  
| | * 810486f (feature/frontend-core) feat(spa): add punch timer widget, 10-leave request modal, printable payslips, and role landing
| | * 566f7e7 feat(cards): build 3-color status indicator cards, view drawer, and dedicated profile page
| | * d7474fb feat(client): implement API service client, auth state store, and navigation bar
| | * 626d5b7 feat(ui): create glassmorphic design system tokens, typography, and layout structure
| |/  
|/|   
| * 1a82df1 Merge pull request #1 from feature/backend-core
|/| 
| * b7d17e7 (feature/backend-core) feat(timeoff): implement atomic leave-attendance propagation and anomaly detection API
| * e8d920b feat(payroll): build Payable-Day Engine and configurable salary formula service
| * 0ecc087 feat(auth): implement JWT authentication, RBAC guards, and immutable Login ID generator
| * 13ddd4a feat(backend): configure persistent database, models, and 10 leave policy schemas
|/  
* 8a91119 chore: initial project structure and package dependencies
```
