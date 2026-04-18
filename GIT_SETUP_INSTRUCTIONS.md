# Git Setup & Sync Instructions — Larinova Workspace
**Run these commands from your terminal, inside the `larinova indonesia` folder.**

---

## PART 1: One-Time Setup (Run once on this machine)

### Step 1 — Navigate to the folder
```bash
cd ~/path/to/larinova\ indonesia
```
> Replace with your actual path, e.g. `cd ~/Desktop/larinova\ indonesia`

### Step 2 — Initialize git
```bash
git init
git config user.name "Gabriel"
git config user.email "gabrielantony56@gmail.com"
```

### Step 3 — Create .gitignore
```bash
cat > .gitignore << 'EOF'
.DS_Store
.~lock.*
*.tmp
Thumbs.db
EOF
```

### Step 4 — Connect to your GitHub repo
```bash
git remote add origin YOUR_REPO_URL_HERE
```
> Paste your GitHub repo URL here, e.g. `https://github.com/yourname/larinova-workspace.git`

### Step 5 — Stage and commit everything
```bash
git add -A
git commit -m "feat: initial commit — all Larinova working documents, audit report, and context"
```

### Step 6 — Create and push the M2-pro branch
```bash
git checkout -b m2-pro
git push -u origin m2-pro
```

### Step 7 — Also create and push main (as the clean baseline)
```bash
git checkout -b main
git push -u origin main
git checkout m2-pro
```

> After this you'll be back on the `m2-pro` branch, which is where all your work on this machine lives.

---

## PART 2: Daily Workflow on THIS Machine

Every time you sit down to work:

```bash
# Pull latest (in case the other laptop pushed something)
git pull origin m2-pro

# ... do your work, add/edit files ...

# Stage and push your changes
git add -A
git commit -m "Brief description of what changed"
git push origin m2-pro
```

---

## PART 3: Setting Up Claude Code on Your Other Laptop (M2 Pro)

Run these commands on the other machine once:

```bash
# Clone the repo
git clone YOUR_REPO_URL_HERE larinova-workspace
cd larinova-workspace

# Switch to the m2-pro branch
git checkout m2-pro

# Verify you're on the right branch
git branch
```

### Giving Claude Code instructions on the M2 Pro

When you start a Claude Code session on the M2 Pro, paste this as your first message:

---
**Claude Code prompt to paste on M2 Pro:**

```
You are working on the Larinova project. The working directory is this repo, on the `m2-pro` branch. 

Your workflow:
1. Always run `git pull origin m2-pro` before starting any work session.
2. Work only on the `m2-pro` branch — never commit directly to `main`.
3. After making any meaningful set of changes, commit with a clear message describing what changed and why.
4. Push with `git push origin m2-pro` when done.
5. Do not merge to main — that's Gabriel's decision after review.

Project context: Read CLAUDE.md for full product, market, and outreach context.
Audit report: Read Larinova_Project_Audit_April2026.md for a full review of all documents and priorities.

Key priorities from the audit:
- Fill in all [placeholder] links once the demo video and sign-up form URLs are live
- Fix the color inconsistency between email template (blue) and other assets (teal)
- Add CRM tracking columns to Larinova_LENGKAP_FINAL.xlsx
- Consolidate the two midwifery docx files into one
- Section 5 of Riset_Pasar_Kebidanan_Larinova_v2.docx is blank — needs content
```

---

## PART 4: Merging M2-Pro → Main (Your Review Step)

When you're happy with what's in `m2-pro` and want to promote it to the clean `main` branch:

```bash
# Make sure m2-pro is up to date first
git checkout m2-pro
git pull origin m2-pro

# Switch to main and merge
git checkout main
git pull origin main
git merge m2-pro --no-ff -m "merge: promote reviewed m2-pro work to main — [describe what's included]"
git push origin main

# Go back to m2-pro to keep working
git checkout m2-pro
```

The `--no-ff` flag creates a merge commit so you can always see what was merged and when — keeps the history clean.

---

## PART 5: Useful Commands

```bash
# See what branch you're on and what's changed
git status

# See recent commits
git log --oneline -10

# See what's different between your branch and main
git diff main..m2-pro --stat

# Undo the last commit (keeps your file changes, just undoes the commit)
git reset --soft HEAD~1

# See all branches (local + remote)
git branch -a
```

---

## Branch Strategy Summary

```
main        ← Clean, reviewed, always stable
  ↑
  └── merge (Gabriel reviews and approves)
        ↑
m2-pro      ← Active work branch (this machine + Claude Code on M2 Pro)
```

Only Gabriel merges to `main`. Claude Code works and commits only on `m2-pro`.

---

## Troubleshooting

**Authentication error when pushing:**  
GitHub no longer accepts passwords — use a Personal Access Token (PAT).
1. Go to github.com → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
2. Generate new token, select `repo` scope
3. Use the token as your password when git prompts you

Or set up SSH keys — GitHub's guide: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

**Merge conflict:**  
```bash
# See which files conflict
git status

# Open the conflicted file, resolve manually (look for <<<< ==== >>>> markers)
# Then:
git add conflicted-file.md
git commit -m "fix: resolve merge conflict in [filename]"
```

**Accidentally worked on main:**  
```bash
# Move your uncommitted changes to m2-pro safely
git stash
git checkout m2-pro
git stash pop
```
