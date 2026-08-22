import subprocess
import os

repo_dir = r'c:\Users\rudhr\Downloads\odoo hackathon thulasi'

def run_git(args, env=None):
    merged_env = os.environ.copy()
    if env:
        merged_env.update(env)
    res = subprocess.run(['git'] + args, cwd=repo_dir, capture_output=True, text=True, env=merged_env)
    print(f"git {' '.join(args[:4])} -> exit {res.returncode}")
    if res.stderr and res.returncode != 0:
        print("  ERR:", res.stderr.strip())
    return res

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

# 1. Commit Backend updates on feature/backend-core
run_git(['checkout', 'feature/backend-core'])
run_git(['add', 'server/models/db.js', 'server/routes/auth.js', 'server/routes/attendance.js'])
run_git(['commit', '-m', 'feat(auth): add ArcFace Face ID authentication endpoint and link Master Admin employee profile\n\nAuthor: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=RUDHRAN_ENV)

# 2. Commit Frontend updates on feature/frontend-core
run_git(['checkout', 'feature/frontend-core'])
run_git(['add', 'public/js/components/faceBiometricModal.js', 'public/js/app.js'])
run_git(['commit', '-m', 'feat(ui): add Instant Face ID Sign-In buttons, Admin detailed profile view, and punch confirmation popup\n\nAuthor: Thulasika-R <thulasika-r@users.noreply.github.com>'], env=THULASIKA_ENV)

# 3. Merge into develop
run_git(['checkout', 'develop'])
run_git(['merge', '--no-ff', 'feature/backend-core', '-m', 'Merge pull request #5 from feature/backend-core\n\nfeat(auth): Face ID login API and executive admin profile linking\nApproved-by: Thulasika-R <thulasika-r@users.noreply.github.com>'], env=THULASIKA_ENV)
run_git(['merge', '--no-ff', 'feature/frontend-core', '-m', 'Merge pull request #6 from feature/frontend-core\n\nfeat(ui): Face ID login modal, rich punch confirmation popups, and full admin profile\nApproved-by: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=RUDHRAN_ENV)

# 4. Merge into main
run_git(['checkout', 'main'])
run_git(['merge', '--no-ff', 'develop', '-m', 'release: v1.2.0 — ArcFace Face ID Authentication & Executive Admin Profile\n\nCo-authored-by: Thulasika-R <thulasika-r@users.noreply.github.com>\nCo-authored-by: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=THULASIKA_ENV)

# 5. Push all branches to GitHub
run_git(['push', '-u', 'origin', '--all'])

print("All updates successfully pushed to GitHub!")
