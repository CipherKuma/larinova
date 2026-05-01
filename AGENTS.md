# Agent Tools — larinova

<!--
Load-bearing: Claude Code reads this at session start. Document every CLI,
script, or tool the agent can reach for here. When Claude learns a useful
shell pattern in this project, add it below. When Claude makes a mistake
that a better tool would have prevented, add that tool here.

Maintain with: /maintain-agents-md
-->

## Installed CLIs

- `gh` — GitHub CLI. Use for PRs, issues, workflow runs. Prefer over GitHub MCP.
- `vercel` — Deployment CLI. Larinova deploys to Vercel. Use `vercel ls`, `vercel logs`, `vercel env`.
- `supabase` — Supabase CLI. Migrations, local DB, RLS testing. Prefer over Supabase MCP for routine work.
- `pnpm` — Package manager (app). Use `pnpm <script>` inside `app/`.
- `npm` — Package manager (landing). Use `npm <script>` inside `landing/`.
- `npx playwright-cli-sessions` — Browser automation with saved auth sessions. See `~/.claude/rules/testing-rules.md`. Prefer over Playwright MCP.
- `cmux` — Terminal multiplexer for multi-agent layouts. See `~/.claude/rules/cmux-teams.md`.
- `yt-dlp` — YouTube/video downloads. Used for research transcripts.
- `~/.claude/vault/inject.sh get VAR1 VAR2 [--dir <path>]` — Env var injection from vault. Never read `.env.master` directly.

## Project scripts

### `app/` (product, `pnpm`)

- `pnpm dev` — Next.js dev server
- `pnpm build` — Production build
- `pnpm start` — Serve production build
- `pnpm lint` — Next lint
- `pnpm test:e2e` — Playwright E2E
- `pnpm test:e2e:headed` — E2E with visible browser
- `pnpm test:e2e:debug` — E2E debug mode
- `pnpm test:e2e:report` — Upload test results to Notion via `tests/e2e/helpers/notion-report.ts`

### `landing/` (marketing, `npm`)

- `npm run dev` — Next.js dev server
- `npm run build` — Production build
- `npm run start` — Serve production build
- `npm run lint` — ESLint

## Preferred shell patterns

- **Playwright auth:** always pass `--session=<name>` — never launch a raw browser just to test authed flows. See testing-rules.md.
- **Env vars:** run `~/.claude/vault/inject.sh get <VAR> --dir <subdir>` — do not hand-edit `.env.local` beyond what vault writes.
- **Vercel verify:** after push, `vercel ls larinova-app` / `vercel ls larinova-landing` to check Ready. A fix is only done when verified on the live URL, impersonated as a non-admin user.
- **Supabase migrations:** use `supabase db push` from the `app/` directory. The `APPLY_MIGRATIONS.sql` is a staging file, not authoritative.
- **Shadcn components:** use the `shadcn` skill. New components go via the CLI, not hand-written.
- **Locale copy edits:** `landing/` copy → `src/data/locale-content.ts` (both `in` + `id` entries). `app/` copy → `messages/in.json` or `messages/id.json`.
- **WhatsApp send verification:** after any WhatsApp send, verify the target chat itself before claiming success. For Marty/personal sends, query `~/Library/Group Containers/group.net.whatsapp.WhatsApp.shared/ChatStorage.sqlite` and, for browser fallback, capture a WhatsApp Web screenshot. `whatsapp-web.js` can report progress while a UI fallback still failed; do not trust an intermediate log alone.
- **WhatsApp Web current UA:** if `ops/whatsapp` hangs before `ready` or shows "WhatsApp works with Google Chrome 85+", set/use a modern Chrome user agent from `ops/whatsapp/config.ts`; the old `whatsapp-web.js` default Chrome 101 UA is unreliable in this environment.

## Things to avoid

- Do **not** install Playwright MCP or Chrome DevTools MCP. `playwright-cli-sessions` covers both. See `~/Documents/infra/playwright-cli-sessions/docs/DEVTOOLS-PARITY-PROPOSAL.md` for the extension plan if coverage gaps emerge.
- Do **not** read `.env.master` directly — always go through `inject.sh`.
- Do **not** commit anything under `.next/`, `node_modules/`, `test-results/`, or any `*.tsbuildinfo`.
- Do **not** use `<input type="date">` or `<input type="number">` — see `~/.claude/rules/ui-rules.md` (use shadcn Calendar + text input with regex parse).
- Do **not** put search icons inside search inputs — see ui-rules.md.
- Do **not** add stat-card dashboards — lead with the primary action. See ui-rules.md.
- Do **not** modify migrations that have already shipped to prod. Create a new forward migration instead.
- Do **not** hardcode copy — always pull from `locale-content.ts` (landing) or `messages/*.json` (app).
- Do **not** address Balachandar Seeman casually ("bro"). He is an elder goodwill advisor for Larinova; use "Seeman Sir" and keep WhatsApp follow-ups concise, respectful, and context-aware.
- Do **not** assume Mac WhatsApp `@lid` chat IDs work cleanly with `whatsapp-web.js` sends. If a `@lid` recipient hangs, use WhatsApp Web search by contact name and verify the sent message in the chat.

<claude-mem-context>
# Memory Context

# [larinova] recent context, 2026-05-01 3:25pm GMT+5:30

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (21,350t read) | 1,231,086t work | 98% savings

### Apr 26, 2026
S183 Larinova Landing — Migrate all CTAs to survey-gated access model, fix build errors, push to GitHub, verify Vercel deployment (Apr 26 at 3:24 PM)
S252 Send a follow-up email to Gabriel's dad regarding company documents and action items from a previously sent email (Apr 26 at 3:25 PM)
### Apr 27, 2026
S501 Sarvam AI Streaming WebSocket API — Critical Gaps in Official Documentation (Apr 27 at 1:28 PM)
### Apr 28, 2026
S503 Doctor Signup — Dual UX Defects Identified: 20s Latency + Redundant Email Verification (Apr 28 at 10:45 AM)
S507 User asked whether all problems are properly solved — confidence check on Larinova signup/invite fixes (Apr 28 at 10:50 AM)
S509 Larinova Auth Migration — Remove passwords entirely, implement OTP-only for email login and direct OAuth for Google/providers (Apr 28 at 11:19 AM)
S518 Mobile App Strategy — How to make the existing desktop web app available as a native iOS/Android app for doctors (Apr 28 at 12:08 PM)
S554 Gmail OAuth Tokens Found in Larinova Ops — Two Accounts Authenticated (Apr 28 at 4:14 PM)
### Apr 30, 2026
S563 WhatsApp SQLite Mirror — Balachandar Seeman Conversation Accessible (Apr 30 at 10:10 AM)
1902 3:28p 🔴 Larinova E2E auth.ts — expires_at Fallback + Cookie Clear Before Inject
1903 " 🟣 Bala-06 — E2E Test: Today's Confirmed Appointment Surfaces on Dashboard and Consultations
1906 3:30p 🔵 Bala-03 Root Cause — Missing Consultation Detail Route Blocks Prescription CTA
1907 " 🔴 Larinova playwright.config.ts — webServer Port Mismatch Fixed
1908 " ✅ Larinova — Vitest Unit Tests Pass for app/lib/appointments/schedule.ts (2/2)
1909 3:31p 🔴 Bala-06 E2E — dashboard.spec.ts getByText Hidden Element Fix
1911 3:33p 🟣 Bala-04 Structured Sick Leave Certificate Form Implemented and Shipped
1912 " 🔵 Production Larinova Session Expired — Magic Link Auth Flow Required for QA Verification
1913 " ✅ ops/whatsapp — Modern Chrome UA Config, Multi-File Send, @lid Caveat, Verification Requirements
1914 " ✅ AGENTS.md — WhatsApp Operational Rules + Balachandar Seeman Etiquette Added
1917 3:35p 🟣 Bala-06 — Commit 986f158: "fix(app): surface scheduled appointments" Pushed to Main
1918 " 🔵 Larinova app/ — app/lib/appointments/schedule.ts Architecture: appointmentToScheduleEntry + sortScheduleEntries
1919 " 🔵 Larinova app/ — prettier Not Installed; pnpm lint Broken with Missing Directory Error
1921 3:36p 🔴 Bala-03 Prescription Workflow Fix — Production Verified on app.larinova.com
1922 " ✅ Playwright Config — Port-Aware webServer Command + Auth Cookie Clear Fix
1923 3:37p ⚖️ Bala-04 Certificate Form Workstream Relaunched After cmux Crash
1926 3:38p 🔵 Bala-04 Production E2E Setup — QA Doctor/Patient Created via Supabase Admin API
1927 " 🔵 SickLeaveCertificate DatePicker — Three Playwright Selector Bugs on Mobile Viewport
1928 " 🔴 DatePicker Popover — avoidCollisions Replaced with collisionPadding for Mobile
1929 " ✅ Bala-04 Unit Test Passing — sick-leave-certificate.test.ts Green
1930 3:39p 🟣 Larinova — Scheduled Appointments Surface on Dashboard and Consultations
1931 " ✅ Bala-04 DatePicker Fix Shipped — Amended into Production Commit and Force-Pushed
1932 " 🔵 Bala-04 Feature Was Already Complete Before cmux Crash — Commit b3d96f5
1933 3:41p 🔵 Vercel Inspect Status Polling — awk Pattern Fails to Parse Status Field
1934 " 🔵 Bala-04 Certificate Created Successfully — Document Title Appears in Two DOM Elements
1935 " 🔵 Vercel Deploy READY — Bala-04 DatePicker Fix Live in Production (47s Build)
1936 " 🔵 DatePicker Calendar data-day Selector Ambiguity — Two Calendars Mounted Simultaneously
1955 3:57p 🔄 Larinova ops/ Directory Reorganized and Gitignore Rules Hardened
1963 4:00p 🔵 Larinova Investor Pitch Deck Session Found — Codex ID 019ddd77
1967 4:02p 🔵 Larinova PWA Icon Wiring — SVG Geometric Placeholder Used Instead of Brand Logo
1968 " 🔵 Larinova Full Brand Asset Inventory — All Image Files Mapped Across Monorepo
S584 Larinova sign-in page UX redesign — handle invite-only access clearly for both returning doctors and new users needing invite codes (Apr 30 at 4:13 PM)
1994 4:14p 🟣 Larinova Sign-In Page — Invite-Only Onboarding UX Redesign
2000 4:18p 🔵 Larinova App Build Clean After Sign-In Redesign
2001 4:20p 🔵 M2 Worker Can Access M4 Dev Server via Tailscale IP for Visual Testing
2002 4:30p 🔵 Logo Audit Finder Open — `tr` and `cp` Not Found in Shell PATH
### May 1, 2026
2031 3:12p 🔵 Inbox Check — SunDAO Ventures Investor Speed Dating Event Requires Action
2032 3:13p ⚖️ Indian Startup Banking — Switching from HDFC to ICICI iStartup Plan
2033 " 🔵 Larinova Private Limited — Full Incorporation Facts Mapped
2034 3:14p 🔵 Larinova Compliance TODO — Bank Recommendation Already Favors ICICI or Kotak (Not HDFC)
2035 3:15p ⚖️ Indian Startup Registration — Banking Switch from HDFC to ICICI iStartup Plan
2036 3:21p ⚖️ Indian Startup Registration — Bank Selection Switched from HDFC to ICICI iStartup Plan
2037 " 🔵 Larinova Company Docs — Incorporation Document Inventory at ops/company-docs/
2038 " 🔵 Playwright Attached Chrome on M2 Worker Was DEAD — Restarted Successfully
2039 3:22p 🔵 inbox-monitor Skill Architecture — Gmail/X/LinkedIn Unified Scanner
2040 " 🔵 gog CLI v0.11.0 Available — Google Workspace Swiss Army Knife
2041 3:23p 🔵 ICICI Online Current Account Portal — Private Ltd Supported, Document Checklist Extracted
2042 " 🔵 Larinova Pvt Ltd — Company Identifiers and Critical Post-Incorporation Deadlines
2043 3:24p 🔵 Larinova ops/company-docs — Full Directory Structure Mapped
2044 3:25p 🔵 ICICI CaOnline Portal — Angular Form Resists Playwright selectOption; Field IDs Fully Mapped
2045 " 🔵 Larinova Admin Allowlist and Doctor Access Architecture Mapped

Access 1231k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>
