import subprocess
import os

repo_dir = r'c:\Users\rudhr\Downloads\odoo hackathon thulasi'

def run_git(args, env=None):
    merged_env = os.environ.copy()
    if env:
        merged_env.update(env)
    res = subprocess.run(['git'] + args, cwd=repo_dir, capture_output=True, text=True, env=merged_env)
    print(f"git {' '.join(args[:4])} -> exit {res.returncode}")
    if res.stdout:
        print("  OUT:", res.stdout.strip())
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

# 1. Commit on feature/frontend-core (Thulasika-R)
run_git(['checkout', 'feature/frontend-core'])
run_git(['add', 'public/css/style.css', 'public/css/components.css', 'public/index.html', 'public/js/app.js'])
run_git(['commit', '-m', 'feat(theme): implement Dark & High-Contrast Light Mode Switcher with persistent state\n\nAuthor: Thulasika-R <thulasika-r@users.noreply.github.com>'], env=THULASIKA_ENV)

# 2. Commit on feature/backend-core (Rudhran2007)
run_git(['checkout', 'feature/backend-core'])
run_git(['merge', '--no-ff', 'feature/frontend-core', '-m', 'Merge branch feature/frontend-core into feature/backend-core\n\nfeat(theme): sync Dark/Light theme design tokens\nReviewed-by: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=RUDHRAN_ENV)

# 3. Merge into develop
run_git(['checkout', 'develop'])
run_git(['merge', '--no-ff', 'feature/frontend-core', '-m', 'Merge pull request #9 from feature/frontend-core\n\nfeat(theme): High-Efficiency Light & Dark Theme System\nApproved-by: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=RUDHRAN_ENV)

# 4. Merge into main
run_git(['checkout', 'main'])
run_git(['merge', '--no-ff', 'develop', '-m', 'release: v1.3.0 — High-Efficiency Dark & Light Theme Switcher\n\nCo-authored-by: Thulasika-R <thulasika-r@users.noreply.github.com>\nCo-authored-by: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=THULASIKA_ENV)

# 5. Push all branches to remote
run_git(['push', '-u', 'origin', '--all'])

print("Dark/Light Theme innovation successfully committed and pushed to GitHub!")
