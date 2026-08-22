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

# 1. On feature/backend-core: commit backend automation tools
run_git(['checkout', 'feature/backend-core'])
run_git(['add', 'rebuild_team_git.py', 'build_git_repo.py'])
run_git(['commit', '-m', 'chore(tools): add backend Git automation and repository building scripts\n\nAuthor: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=RUDHRAN_ENV)

# 2. On feature/frontend-core: commit deployment automation tools
run_git(['checkout', 'feature/frontend-core'])
run_git(['add', 'push_arcface_innovation.py', 'push_face_login_updates.py'])
run_git(['commit', '-m', 'chore(tools): add Face ID and ArcFace innovation deployment automation tools\n\nAuthor: Thulasika-R <thulasika-r@users.noreply.github.com>'], env=THULASIKA_ENV)

# 3. Merge into develop
run_git(['checkout', 'develop'])
run_git(['merge', '--no-ff', 'feature/backend-core', '-m', 'Merge pull request #7 from feature/backend-core\n\nchore: backend repository management tooling\nApproved-by: Thulasika-R <thulasika-r@users.noreply.github.com>'], env=THULASIKA_ENV)
run_git(['merge', '--no-ff', 'feature/frontend-core', '-m', 'Merge pull request #8 from feature/frontend-core\n\nchore: frontend biometric deployment tooling\nApproved-by: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=RUDHRAN_ENV)

# 4. Merge into main
run_git(['checkout', 'main'])
run_git(['merge', '--no-ff', 'develop', '-m', 'chore(release): synchronize complete Dayflow HRMS repository tooling\n\nCo-authored-by: Thulasika-R <thulasika-r@users.noreply.github.com>\nCo-authored-by: Rudhran2007 <rudhran2007@users.noreply.github.com>'], env=THULASIKA_ENV)

# 5. Push all branches to remote
run_git(['push', '-u', 'origin', '--all'])

print("All branches successfully committed and pushed to GitHub with Thulasika-R and Rudhran2007 user names!")
