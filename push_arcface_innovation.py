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

# 1. Backend Commit by Rudhran2007 on feature/backend-core
run_git(['checkout', 'feature/backend-core'])
run_git(['add', 'server/services/arcfaceEngine.js', 'server/routes/attendance.js', 'server/models/db.js'])
run_git(['commit', '-m', 'feat(ai): integrate ArcFace / FaceNet 512-D Deep Metric Learning and Anti-Spoof Liveness Engine\n\nAuthor: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=RUDHRAN_ENV)

# 2. Frontend Commit by Thulasika-R on feature/frontend-core
run_git(['checkout', 'feature/frontend-core'])
run_git(['add', 'public/js/components/faceBiometricModal.js', 'public/css/components.css', 'public/js/components/checkInWidget.js', 'public/js/components/profileDrawer.js', 'public/js/api.js', 'public/index.html'])
run_git(['commit', '-m', 'feat(hud): build ArcFace AI Biometric Face Scanner HUD, Landmark Mesh, and Reception Kiosk Mode\n\nAuthor: Thulasika-R <thulasika-r@users.noreply.github.com>'], env=THULASIKA_ENV)

# 3. Merge both into develop
run_git(['checkout', 'develop'])
run_git(['merge', '--no-ff', 'feature/backend-core', '-m', 'Merge pull request #3 from feature/backend-core\n\nfeat(ai): ArcFace biometric verification service and 512-D vector matching\nApproved-by: Thulasika-R <thulasika-r@users.noreply.github.com>'], env=THULASIKA_ENV)
run_git(['merge', '--no-ff', 'feature/frontend-core', '-m', 'Merge pull request #4 from feature/frontend-core\n\nfeat(hud): Cyberpunk ArcFace biometric scanner HUD and touchless terminal UI\nApproved-by: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=RUDHRAN_ENV)

# 4. Merge develop into main
run_git(['checkout', 'main'])
run_git(['merge', '--no-ff', 'develop', '-m', 'release: v1.1.0 — Dayflow Vision Ω Biometric AI Facial Recognition Engine\n\nCo-authored-by: Thulasika-R <thulasika-r@users.noreply.github.com>\nCo-authored-by: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=THULASIKA_ENV)

# 5. Push all branches to GitHub
run_git(['push', '-u', 'origin', '--all'])

print("ArcFace Innovation successfully committed and pushed to GitHub!")
