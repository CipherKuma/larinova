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
- **Supabase project:** all three apps (`app/`, `landing/`, `patient-portal/`) use the same Supabase project, `afitpprgfsidrnrrhvzs` (`https://afitpprgfsidrnrrhvzs.supabase.co`). Verify this ref before any data mutation; `vziyntciabkelnaujliq` is not the Larinova app database. See `docs/ENVIRONMENT.md`.
- **Env vars:** for Larinova Supabase, prefer the vault keys with `_LARINOVA` suffix and map them to the app's expected env names. Do not inject the generic `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` into Larinova without verifying. Run `node scripts/verify-supabase-env.mjs` before any data mutation.
- **Vercel verify:** after push, `vercel ls larinova-app` / `vercel ls larinova-landing` / `vercel ls larinova-patient` to check Ready. A fix is only done when verified on the live URL, impersonated as a non-admin user.
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
- Do **not** use affectionate or overly formal legacy greetings/signoffs in Gabriel's outbound comms. Avoid "Dear", "Love", "Warm regards", etc. Use concise, direct professional language such as "Hi <name>," or start with context directly.

<claude-mem-context>
# Memory Context

# [larinova] recent context, 2026-05-01 5:45pm GMT+5:30

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (20,955t read) | 735,265t work | 97% savings

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
S584 Larinova sign-in page UX redesign — handle invite-only access clearly for both returning doctors and new users needing invite codes (Apr 30 at 4:13 PM)
### May 1, 2026
2082 3:42p 🔵 Larinova Bank Account Agent — 5 Open Questions Surfaced for Current Account Setup
2083 " 🔵 Larinova STARTUP_OPPS_2026.md — Accelerator & Funding Strategy Fully Mapped
2084 3:43p 🔄 Larinova — Server-Side Pre-fetch Eliminates Client-Side Waterfall API Calls on Protected Routes
2085 " 🔵 Larinova Private Limited — Company State, Compliance Roadmap, and Funding Strategy Mapped
2086 3:44p 🔵 Larinova Production Performance Baseline — Slow Pages and API Routes Identified
2087 3:45p 🔴 Larinova App — Task Patient Lookup Deferred Fix Shipped
2088 3:48p 🔵 Larinova App — Full Route and API Surface Mapped for Performance Audit
2089 3:51p 🔵 Larinova Production Performance Audit — Slow Pages and APIs Baseline
2090 " 🔵 Performance Regression Found — DCL Increased After /api/user/shell Removal
2091 " 🔄 Protected Layout — Server-Side getUserShellData Removed, Sidebar/MobileNav Fetch Client-Side
2092 3:52p 🔵 Larinova App — Full Route Inventory (Next.js 16.1.6, 122 Static Pages + All Dynamic Routes)
2093 " ✅ Shell Data Refactor Committed and Deployed to Vercel Production
2094 3:53p 🔵 Larinova Performance Session — Three Sequential Commits, Vercel Project Inventory Confirmed
2095 3:54p 🔵 Larinova Vercel Deployment Failed with Unexpected Error
2096 3:55p 🔵 Vercel CLI `logs` Command Hangs with No Output on Error Deployments
2097 " 🔵 Larinova App — Full API Route Inventory Mapped
2098 3:56p 🔵 Larinova Vercel Deploy — Token Passing Gotcha with vercel pull + spawnSync
2099 " 🔵 Larinova App Sends OTP to gabrielantony56@gmail.com Despite No Active Invited Doctors
2100 " ⚖️ Larinova App — Full Performance Audit Initiated for app.larinova.com
2101 3:58p 🔵 Larinova OTP Root Cause — gabrielantony56@gmail.com Exists in auth.users With No Doctor Row
2102 " 🔴 Larinova Sign-In — Pre-flight Email Gate Added Before OTP Dispatch
2103 3:59p 🔵 Larinova App — Complete Route Map (28 Page Routes + 100+ API Routes)
2104 " ✅ Larinova — Successful Prebuilt Vercel Production Deployment to app.larinova.com
2105 4:01p ✅ Larinova Production Build Passes + Database Reset to Clean Admin-Only State
2106 4:02p 🔵 Larinova Production Performance Audit — Baseline Timings for All Routes
2107 " 🔴 Perf Audit Script — Auth Cookies Refreshed Before Each Page Measurement
2108 4:03p 🔵 Larinova Operations — 18-Surface cmux Team Active for Company Setup
2109 " ⚖️ OPERATIONS_TRACKER.md Designated as Source of Truth for Funding/Program Status
2110 4:04p 🔵 Larinova Private Limited — Incorporation Confirmed via Email Trail
2111 4:05p ✅ Larinova — ADT-1 Auditor Outreach Sent via Email and WhatsApp
2112 4:06p 🔵 WhatsApp Message to Murugan Confirmed Delivered via ChatStorage.sqlite
2113 " ✅ OPERATIONS_TRACKER.md Updated with ADT-1 Outreach Actions and Activity Log
2114 " 🔴 Larinova Auth Gate Refined — hasAlphaDoctorAccess Requires Invite Claim/Redeem, Not Just Doctor Profile
2116 4:07p ✅ Larinova Alpha Gate Fix — Final Build Passes Clean (122 Routes, Zero TypeScript Errors)
2115 " ⚖️ Larinova Compliance — Three Parallel Workstreams Dispatched via cmux Surfaces
2117 4:08p ✅ CS Murugan Contact Outreach — Rax Ops Filing Step
2118 4:09p ✅ Larinova Alpha Gate Fix Committed and Pushed to Production (SHA 1fcc737)
2119 " ⚖️ GST/IEC/Udyam Readiness — Pre/Post Bank Account Task Split Initiated
2121 4:10p 🔴 Larinova Alpha Gate Fix — Production Verified on app.larinova.com (SHA 1fcc737)
2122 4:12p 🔵 Larinova PWA Architecture Mapped — Serwist Service Worker, Manifest, Install Gate E2E Tests
2123 4:13p 🟣 Larinova PWA — Animated Launch Splash Screen Added for Standalone Mode
2124 4:14p 🟣 Larinova PWA Launch Splash — Build Passes, Dev Server Starts on Port 3000
2125 4:15p 🟣 Larinova PWA Launch Splash — Playwright Test Verified: Shows on Mount, Hides After 1450ms
2126 4:16p ⚖️ Messaging Tone Rule — No "Dear" or "Love" Salutations
2127 " 🟣 Larinova Sign-In — "Not Recognized" Email Error State Redesigned with Access Request Flow
2128 4:18p 🟣 Larinova PWA Launch Splash Screen Added
2129 " ✅ Larinova Invite-Only UX — Commit 04e298b Pushed and Vercel Deploy Triggered
2130 4:19p 🔵 Larinova Vercel Token Exposed in Process List
2131 4:20p ✅ Larinova Invite-Only UX — Production Deployment larinova-mp5ldhobp Confirmed Ready
2132 " ✅ Larinova Invite-Only UX — Production Verified on app.larinova.com

Access 735k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>
