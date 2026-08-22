import subprocess
import os

repo_dir = r'c:\Users\rudhr\Downloads\odoo hackathon thulasi'

def run_git(args, env=None):
    merged_env = os.environ.copy()
    if env:
        merged_env.update(env)
    res = subprocess.run(['git'] + args, cwd=repo_dir, capture_output=True, text=True, env=merged_env)
    cmd_str = ' '.join(args[:4])
    print(f"git {cmd_str} -> exit {res.returncode}")
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

# 1. Commit on feature/frontend-core
run_git(['checkout', 'feature/frontend-core'])
run_git(['add', 'push_theme_switcher.py'])
run_git(['commit', '-m', 'chore(tools): add theme switcher deployment automation script\n\nAuthor: Thulasika-R <thulasika-r@users.noreply.github.com>'], env=THULASIKA_ENV)

# 2. Merge into develop
run_git(['checkout', 'develop'])
run_git(['merge', '--no-ff', 'feature/frontend-core', '-m', 'Merge pull request #10 from feature/frontend-core\n\nchore: theme deployment script\nApproved-by: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=RUDHRAN_ENV)

# 3. Merge into main
run_git(['checkout', 'main'])
run_git(['merge', '--no-ff', 'develop', '-m', 'chore: sync repository scripts and theme assets\n\nCo-authored-by: Thulasika-R <thulasika-r@users.noreply.github.com>\nCo-authored-by: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=THULASIKA_ENV)

# 4. Push all branches
run_git(['push', '-u', 'origin', '--all'])

print("All branches successfully pushed to GitHub!")
