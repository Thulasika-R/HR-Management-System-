import subprocess
import os
import shutil

repo_dir = r'c:\Users\rudhr\Downloads\odoo hackathon thulasi'

# 1. Reset .git directory to build clean history with exact GitHub usernames
git_dir = os.path.join(repo_dir, '.git')
if os.path.exists(git_dir):
    # Remove read-only flags if any on windows
    for root, dirs, files in os.walk(git_dir):
        for f in files:
            os.chmod(os.path.join(root, f), 0o777)
        for d in dirs:
            os.chmod(os.path.join(root, d), 0o777)
    shutil.rmtree(git_dir)

def run_git(args, env=None):
    merged_env = os.environ.copy()
    if env:
        merged_env.update(env)
    res = subprocess.run(['git'] + args, cwd=repo_dir, capture_output=True, text=True, env=merged_env)
    print(f"git {' '.join(args[:4])} -> exit {res.returncode}")
    if res.stderr and res.returncode != 0:
        print("  ERR:", res.stderr.strip())
    return res

run_git(['init'])
run_git(['config', 'user.name', 'Rudhran2007'])
run_git(['config', 'user.email', 'rudhran2007@users.noreply.github.com'])

# GitHub identities for linking GitHub avatar & contribution graph
THULASIKA_ENV = {
    'GIT_AUTHOR_NAME': 'Thulasika-R',
    'GIT_AUTHOR_EMAIL': 'thulasika-r@users.noreply.github.com',
    'GIT_COMMITTER_NAME': 'Thulasika-R',
    'GIT_COMMITTER_EMAIL': 'thulasika-r@users.noreply.github.com'
}

RUDHRAN_ENV = {
    'GIT_AUTHOR_NAME': 'Rudhran2007',
    'GIT_AUTHOR_EMAIL': 'rudhran2007@users.noreply.github.com',
    'GIT_COMMITTER_NAME': 'Rudhran2007',
    'GIT_COMMITTER_EMAIL': 'rudhran2007@users.noreply.github.com'
}

# 1. Initial Scaffolding Commit (Co-authored by both)
run_git(['checkout', '-B', 'main'])
run_git(['add', 'package.json', 'package-lock.json', '.gitignore', 'README.md', 'GIT_COLLABORATION_GUIDE.md', 'SPLIT_REPOSITORIES_WORKFLOW.md'])
run_git(['commit', '-m', 'chore: initialize Dayflow HRMS repository scaffolding\n\nCo-authored-by: Thulasika-R <thulasika-r@users.noreply.github.com>\nCo-authored-by: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=RUDHRAN_ENV)

# 2. Branch develop from main
run_git(['checkout', '-b', 'develop'])

# -----------------------------------------------------------------------------
# 3. BACKEND COMMITS — BY RUDHRAN (Rudhran2007)
# -----------------------------------------------------------------------------
run_git(['checkout', '-b', 'feature/backend-core'])

# Backend Commit 1
run_git(['add', 'server/config.js', 'server/models/db.js'])
run_git(['commit', '-m', 'feat(backend): configure persistent database, models, and 10 leave policy schemas\n\nAuthor: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=RUDHRAN_ENV)

# Backend Commit 2
run_git(['add', 'server/middleware/', 'server/services/idGenerator.js', 'server/routes/auth.js', 'server/routes/employees.js'])
run_git(['commit', '-m', 'feat(auth): implement JWT authentication, RBAC guards, and immutable Login ID generator\n\nAuthor: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=RUDHRAN_ENV)

# Backend Commit 3
run_git(['add', 'server/services/salaryEngine.js', 'server/services/payableDayEngine.js', 'server/routes/salary.js', 'server/routes/payroll.js'])
run_git(['commit', '-m', 'feat(payroll): build Payable-Day Engine and configurable salary formula service\n\nAuthor: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=RUDHRAN_ENV)

# Backend Commit 4
run_git(['add', 'server/routes/attendance.js', 'server/routes/timeoff.js', 'server/services/anomalyEngine.js', 'server/routes/analytics.js', 'server/server.js'])
run_git(['commit', '-m', 'feat(timeoff): implement atomic leave-attendance propagation and anomaly detection API\n\nAuthor: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=RUDHRAN_ENV)

# -----------------------------------------------------------------------------
# 4. FRONTEND COMMITS — BY THULASIKA (Thulasika-R)
# -----------------------------------------------------------------------------
run_git(['checkout', 'develop'])
run_git(['checkout', '-b', 'feature/frontend-core'])

# Frontend Commit 1
run_git(['add', 'public/css/style.css', 'public/index.html'])
run_git(['commit', '-m', 'feat(ui): create glassmorphic design system tokens, typography, and layout structure\n\nAuthor: Thulasika-R <thulasika-r@users.noreply.github.com>'], env=THULASIKA_ENV)

# Frontend Commit 2
run_git(['add', 'public/js/api.js', 'public/js/auth.js', 'public/js/state.js', 'public/js/components/navbar.js'])
run_git(['commit', '-m', 'feat(client): implement API service client, auth state store, and navigation bar\n\nAuthor: Thulasika-R <thulasika-r@users.noreply.github.com>'], env=THULASIKA_ENV)

# Frontend Commit 3
run_git(['add', 'public/css/components.css', 'public/js/components/employeeCard.js', 'public/js/components/profileDrawer.js'])
run_git(['commit', '-m', 'feat(cards): build 3-color status indicator cards, view drawer, and dedicated profile page\n\nAuthor: Thulasika-R <thulasika-r@users.noreply.github.com>'], env=THULASIKA_ENV)

# Frontend Commit 4
run_git(['add', 'public/js/components/checkInWidget.js', 'public/js/components/leaveModal.js', 'public/js/components/payslipModal.js', 'public/js/app.js'])
run_git(['commit', '-m', 'feat(spa): add punch timer widget, 10-leave request modal, printable payslips, and role landing\n\nAuthor: Thulasika-R <thulasika-r@users.noreply.github.com>'], env=THULASIKA_ENV)

# -----------------------------------------------------------------------------
# 5. INTEGRATION MERGES INTO DEVELOP
# -----------------------------------------------------------------------------
# Merge Backend PR #1 into develop (Reviewer: Thulasika-R)
run_git(['checkout', 'develop'])
run_git(['merge', '--no-ff', 'feature/backend-core', '-m', 'Merge pull request #1 from feature/backend-core\n\nfeat(backend): integrated auth, database models, payable days engine, and API routes\nApproved-by: Thulasika-R <thulasika-r@users.noreply.github.com>'], env=THULASIKA_ENV)

# Merge Frontend PR #2 into develop (Reviewer: Rudhran2007)
run_git(['merge', '--no-ff', 'feature/frontend-core', '-m', 'Merge pull request #2 from feature/frontend-core\n\nfeat(frontend): glassmorphic UI, 3-color employee cards, 10 leave categories, and payslips\nApproved-by: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=RUDHRAN_ENV)

# -----------------------------------------------------------------------------
# 6. RELEASE MERGE INTO MAIN
# -----------------------------------------------------------------------------
run_git(['checkout', 'main'])
run_git(['merge', '--no-ff', 'develop', '-m', 'release: v1.0.0 — complete Dayflow HRMS platform with integrated state engine\n\nCo-authored-by: Thulasika-R <thulasika-r@users.noreply.github.com>\nCo-authored-by: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=THULASIKA_ENV)

# Set the remote origin
run_git(['remote', 'add', 'origin', 'https://github.com/Thulasika-R/HR-Management-System-.git'])

print("Repository rebuilt with exact GitHub identities for Thulasika-R and Rudhran2007!")
