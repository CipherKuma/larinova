# Claude Code Handoff Prompt

**How to use:** Open this folder with Claude Code (`cd ~/path/to/larinova && claude`), then paste the prompt below (everything between the `---` lines) as your first message.

---

# Context

I'm consolidating two laptops (M4 Pro and M2 Pro) into a single **private** GitHub repo. I've already created the empty private repo at:

**`https://github.com/gabrielantonyxaviour/larinova-workspace`**

This folder is the M4 Pro state. Current contents:

- `docs/` — strategy docs (sales plan, pricing plan, competitive research, Sigda Optima form spec)
- `sales/` — pitch-deck PDFs, discovery-form PDFs, launch playbook, Indonesia leads xlsx
- `logo-gen/` — brand logos and icons
- `command-center/` — AI agent skill definitions
- `_archive/deprecated-kosyn/` — pre-rebrand archive (historical only)
- `landing/` — marketing site (Next.js). **Note:** was its own git repo pointing to `github.com/gabrielantonyxaviour/larinova-landing` with a second remote at `CipherKuma/larinova-landing`. A previous Cowork session renamed its `.git` folder to `.git-stashed` for a flattening attempt. The git history is preserved on both GitHub remotes; treat the folder as flat files.
- `mvp-web-app/` — product app (Next.js + Supabase). Same story: `.git-stashed` folder, history preserved on `github.com/gabrielantonyxaviour/larinova-mvp` and `CipherKuma/larinova-mvp`.
- `CLAUDE.md` — project overview
- `AUDIT_2026-04-18.md` — recent honest audit
- Possibly leftover artifacts: `.git-broken/` (failed init), `.delete-me-larinova-workspace.bundle` (stale bundle), `subrepo-git-backups/` (tarballs of the stashed .git folders). Delete these if present.

# Goal

Set up this folder as a flat monorepo, push a snapshot of the M4 Pro state to the new private repo, and leave `main` as the clean branch we'll merge into after the M2 Pro snapshot lands.

# Tasks (in order)

1. **Verify safety first:** confirm that `github.com/gabrielantonyxaviour/larinova-landing` and `github.com/gabrielantonyxaviour/larinova-mvp` both exist and have recent commits. We're about to delete the local `.git-stashed` folders — I need to know their history is safe on GitHub before doing that. If either remote is inaccessible or looks empty, STOP and report.

2. **Clean up leftovers:**
   - Delete `landing/.git-stashed` and `mvp-web-app/.git-stashed`
   - Delete `.git-broken/` if it exists at the root
   - Delete `.delete-me-larinova-workspace.bundle` if it exists
   - Delete `subrepo-git-backups/` if it exists at the root
   - Leave `_archive/deprecated-kosyn/` alone — keep it

3. **Write a thorough `.gitignore` at the root** covering:
   - Secrets: `.env`, `.env.*` (but allow `.env.example`), `*.pem`, `*.key`, `*.cert`
   - Dependencies: `node_modules/`, `.pnp*`, `.yarn/*` (with standard exceptions)
   - Build output: `.next/`, `.turbo/`, `.vercel/`, `out/`, `build/`, `dist/`
   - Test/coverage: `coverage/`, `.nyc_output/`, `playwright-report/`, `test-results/`
   - Logs: `*.log`, `npm-debug.log*`, `yarn-debug.log*`, `pnpm-debug.log*`
   - OS: `.DS_Store`, `Thumbs.db`
   - Editor: `.vscode/` (except shared configs), `.idea/`, `*.swp`
   - AI/tools scratch: `.playwright-data/`, `.playwright-mcp/`, `.superpowers/brainstorm/`
   - Supabase temp: `**/supabase/.temp/`, `**/supabase/.branches/`
   - TypeScript: `next-env.d.ts`, `*.tsbuildinfo`
   - Claude Code local settings: `.claude/settings.local.json`

4. **Write a `README.md`** at the root explaining: what this monorepo contains, the two-laptop branching model (`main` = merged state, `m4-pro` = M4 Pro snapshot, `m2-pro` = M2 Pro snapshot), how to install deps in each sub-project, and a note that secrets live in `.env*` files (gitignored).

5. **Initialize git:**
   - `git init -b main`
   - Configure user: `Gabriel Antony Xaviour`, `gabrielantony56@gmail.com` (local to this repo, not global)

6. **Initial commit on `main`:** stage ONLY `.gitignore` and `README.md`, commit with message `Initial commit: README + gitignore`. This becomes the clean baseline both laptop branches will diverge from.

7. **Create and switch to `m4-pro` branch:** `git checkout -b m4-pro`

8. **Stage everything else** with `git add .`. Before committing, run a safety check: `git ls-files --cached | grep -E '\.env($|\.[a-z]+$)' | grep -v '\.example$'` — this MUST return empty. If it returns anything, abort, investigate, fix `.gitignore`, and retry.

9. **Commit on `m4-pro`** with message:
   ```
   Snapshot from M4 Pro laptop: full workspace as of <today's date>

   Includes landing/, mvp-web-app/, docs/, sales/, logo-gen/,
   command-center/, _archive/, CLAUDE.md, AUDIT_2026-04-18.md.

   Sub-repos (landing/ and mvp-web-app/) previously had their own
   git histories pointing to separate GitHub repos. Those histories
   remain on those remotes; this monorepo captures the current
   working state as flat files for cross-laptop sync.
   ```

10. **Add remote and push:**
    - `git remote add origin git@github.com:gabrielantonyxaviour/larinova-workspace.git` (use SSH since my `gh` is configured for SSH; switch to HTTPS `https://github.com/...` if needed)
    - `git push -u origin main`
    - `git push -u origin m4-pro`

11. **Verify:** show `git remote -v`, `git branch -a`, and `git log --oneline --all` so I can confirm both branches landed on GitHub. Don't run `gh repo view` — just confirm the push succeeded.

# Guardrails

- Do NOT commit any real `.env` files. Only `.env.example` variants are OK.
- Do NOT push to `larinova-landing` or `larinova-mvp` remotes — those are separate repos I want untouched.
- If any file looks like it contains credentials (tokens, API keys, private keys), flag them to me BEFORE committing.
- If the working tree size is larger than ~200 MB before push, something's wrong with `.gitignore` — stop and check.

# After this is done

I'll run an equivalent prompt on the M2 Pro laptop (different folder state, pushing to an `m2-pro` branch on the same repo). Then I'll come back to you to merge `m4-pro` and `m2-pro` into `main` and resolve conflicts.
