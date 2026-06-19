# Larinova — Production-Readiness Audit & To-Do

**Date:** 2026-06-19
**Branch:** `claude/upbeat-cori-0fd23e`
**Scope:** `app/` (doctor app, 90 API routes / 38 pages), `patient-portal/`, `landing/`
**Method:** 6 parallel deep-read audits + verified build/test/lint baseline + manual RLS confirmation. Read-only — no product code changed by this audit.

---

## TL;DR verdict

The product is **substantially built and architecturally sound** — the clinical AI layer, auth (OTP-only), Razorpay crypto, and the certificate *drafting* logic are genuinely good work. It is **not yet safe to sell or onboard real patients** because of one catastrophic data-isolation hole, a core feature (consult recording) that dies after ~1 minute, silent AI failures, a red test suite, and a missing "output half" of the documents module.

**Do not onboard real patient data until P0-1 (RLS) is fixed.** It is a full PHI breach today.

### Verified baseline (ground truth, run this session)

| Check | Result | Notes |
|---|---|---|
| `pnpm build` (no secrets) | ❌ **FAILS** | Crashes at module load: `new Resend()` in `lib/resend/email.ts` with no `RESEND_API_KEY`. Breaks CI/preview/fresh-clone. |
| `pnpm build` (placeholder env) | ✅ passes (exit 0) | So prod Vercel build works; the failure is eager-init fragility, not a type/code error. |
| `pnpm exec vitest run` | ❌ **11 failed / 90 passed** (101 total, 2 files red) | `lib/ai/claude.test.ts` (8, dead code) + `razorpay/webhook/route.test.ts` (3, stale mock). |
| `pnpm lint` | ❌ broken script | `next lint` was removed in Next 16; script errors out. Type-check (via build) passes. |
| Stack | Next 16 / React 19 / Supabase / next-intl | — |

---

## P0 — Launch blockers (fix before any real doctor/patient data)

### P0-1 · Catastrophic RLS hole — every authenticated user can read all PHI
**This is the single most important finding. Manually confirmed in the migration SQL.**

`app/supabase/migrations/20260123184843_create_kosyn_tables.sql` creates permissive policies that are **never dropped by any later migration**:

- `larinova_patients` — `FOR SELECT TO authenticated USING (true)` (`:357-360`), INSERT `WITH CHECK (true)` (`:363-366`), UPDATE `USING (true)` (`:369-372`)
- `larinova_consultations` — `FOR ALL TO authenticated USING (true)` (`:395-398`)
- `larinova_transcripts` — `FOR ALL USING (true)` (`:401-404`)
- `larinova_prescriptions` / `larinova_prescription_items` — `FOR ALL USING (true)` (`:407-415`)
- `larinova_health_records`, `larinova_insurance` — `FOR ALL USING (true)` (`:383-392`)

The later `20260423103800_patient_portal_rls_policies.sql` *adds* email-scoped SELECT policies — but **Postgres RLS policies are permissive and OR'd together**, so `USING(true) OR USING(email=jwt.email)` still evaluates to `true`. Adding scoped policies does nothing while the `true` policies exist.

**Impact:** The app + patient portal use the **public anon key** (shipped in the browser bundle) and rely on RLS for tenant isolation. With these policies, *any* authenticated session — any doctor, and any patient who got a magic-link login on the portal — can hit PostgREST directly (`/rest/v1/larinova_patients?select=*`) and read/modify **every patient's** name, diagnosis, doctor notes, SOAP notes, transcripts, prescriptions, and insurance. Cross-tenant read **and write**.

**Fix:**
1. New forward migration that `DROP`s every `USING(true)` / `FOR ALL` permissive policy on the clinical tables.
2. Recreate them doctor-scoped: `doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())` (the pattern already correct on `larinova_documents`, `larinova_appointments`, `helena_*`) and patient-scoped (`email = auth.jwt()->>'email'`) for portal reads.
3. Add defense-in-depth `.eq("doctor_id", doctor.id)` / ownership checks in the routes that currently read by bare id (see P0-2).
4. **Verify against the production DB** which policies are actually live: `select tablename, policyname, qual from pg_policies where tablename like 'larinova_%';`

### P0-2 · ~10 clinical routes read by bare id, relying on the broken RLS
Even after RLS is fixed, these need code-level ownership guards (defense in depth). All read/generate against a consultation or patient by bare id with no `doctor_id` filter:

- `app/api/consultations/[id]/route.ts:42` (GET)
- `app/api/consultations/[id]/create-documents/route.ts:34` (read + 4 writes)
- `app/api/consultations/[id]/soap-note/route.ts:39,62,169`
- `app/api/consultations/[id]/medical-codes/route.ts:67,161`
- `app/api/consultations/[id]/summary/route.ts`
- `app/api/consultations/[id]/transcripts/route.ts:34,82` + `transcripts/[transcriptId]/route.ts:30`
- `app/api/consultations/start/route.ts:69-73` (existing-patient path — no `created_by_doctor_id` filter → can attach another doctor's patient)
- `app/api/helena/chat/route.ts:158-180` (injects another doctor's PHI into the LLM context)
- `app/api/dashboard/stats/route.ts:36-38` (`totalPatients` counts **all** patients system-wide)

**Fix:** gate each on consultation/patient ownership (the pattern already used in `notes`/`link-patient`/`prescriptions/create`).

### P0-3 · Consultation recording dies after ~1 minute (the declared P0 bug)
Core feature. Two independent defects on the India path:

- **Streaming (default):** the Sarvam WebSocket has **no keepalive/ping**; only a 10s open-guard exists. An idle-socket close by the proxy/Sarvam (~60–120s typical cloud timeout) silently ends recording. → `app/hooks/useSarvamStreamingSTT.ts:286-356`.
- **REST fallback (`NEXT_PUBLIC_STT_STREAMING="false"`):** a failed `fetch` is swallowed and `processingRef` can stick `true` → "zombie" state: mic on, UI says "recording," nothing transcribes, no error. → `app/hooks/useSarvamSTT.ts:160-164,209-232,296-308`.

**Fix:** add a periodic WS keepalive/ping + auto-reconnect with transcript continuity; surface REST fetch failures via `onError` with retry/backoff; handle `visibilitychange`/suspended `AudioContext` (`useSarvamStreamingSTT.ts:111-113`).

### P0-4 · Diarize can permanently destroy a consult's transcript
`app/api/consultations/[id]/diarize/route.ts:195-223` (`replaceTranscriptsWithDiarized`) **deletes** all live transcript rows, then inserts diarized rows. Delete is not transactional with insert — if the insert fails or returns 0 usable rows, the transcript is **gone**.
**Fix:** insert-then-delete, or wrap both in a transaction; never delete before the replacement is confirmed persisted.

### P0-5 · Post-consult AI generation fails silently (doctor sees green, gets empty notes)
`app/app/[locale]/(protected)/consultations/new/record/page.tsx:163-224`: the orchestrator wraps each step in `.catch(() => null)` **and marks the step "done" even on failure** (`:219-221`). A failed SOAP/summary/codes call shows a green check, then produces an empty/partial clinical document with no signal to the doctor. Unacceptable for a clinical record.
**Fix:** per-step error state; render failed steps as errors with retry; never mark "done" in a catch.

### P0-6 · Test suite is red (CI cannot gate releases)
`pnpm exec vitest run` → **11 failures**:
- `lib/ai/claude.test.ts` (8) — tests `lib/ai/claude.ts`, which is **intentionally disabled** (throws "disabled — import from sarvam"). Stale tests for dead code. → delete both files.
- `app/api/razorpay/webhook/route.test.ts` (3) — the mock only knows `larinova_subscriptions`; the route now also queries `larinova_doctors` (`route.ts:129,154,213`) → mock throws "Unexpected table," handler returns 500. **The webhook's doctor-grant path is effectively untested.** → update the mock; add coverage for the doctor lookup.

### P0-7 · Build fails without secrets (breaks CI / preview / onboarding)
`app/lib/resend/email.ts` instantiates `new Resend(process.env.RESEND_API_KEY)` at **module scope**, so `next build` crashes ("Missing API key") in any env without the key. Confirmed: build passes with a placeholder key, fails without.
**Fix:** lazy-init the client (match the graceful pattern in `lib/notify/email.ts:6-9` which returns a null client when the key is missing). Also fix the broken `lint` script (migrate off the removed `next lint`).

---

## P1 — Major gaps (block selling / erode trust; not data-breach severity)

### P1-1 · Documents / Certificates — strong drafting, broken output half
The 6-type medical-certificate generator (`lib/documents/sick-leave-certificate.ts`, MCI-2002-aligned, zod-validated, locale-aware) is good. But the delivery/finalization layer is broken or missing:

| Gap | Evidence | Fix |
|---|---|---|
| **No doctor signature** — every cert prints a blank line + "DRAFT DOCUMENT — requires doctor signature & seal before use" | `DocumentPrintPreview.tsx:219-225`; `sick-leave-certificate.ts:255-260` | Capture signature (saved profile PNG / drawn canvas), render into preview + PDF |
| **Header + signature duplicated** in rendered/printed output | `sick-leave-certificate.ts:223-260` embeds header; `parse-sections.ts:42-44` returns it as one blob; `DocumentPrintPreview.tsx:128-140,219-225` re-adds header+sig | Dedicated cert renderer that doesn't re-add chrome, or strip embedded header |
| **List view ≠ detail view** for the same document | `documents/page.tsx:349` (`DocumentPrintPreview`) vs `documents/[id]/page.tsx:402` (`ReactMarkdown`) | Unify on one renderer |
| **"Mark as Sent" emails nothing** — only PATCHes status | `documents/page.tsx:117-135,371`; `[id]/route.ts:50-96`; no document-emailing route exists | Add a real "send document to patient" route (PDF via Resend) + write `sent_at`/`sent_to` |
| **No document audit trail** (no signed/sent/viewed events); `track-view` route exists but is never called | grep: no `document.signed` audit anywhere; `track-view/route.ts` has zero callers | Build create/finalize/sent/viewed audit events (medico-legal requirement) |
| **Email claims a PDF attachment that's never attached** | `templates/consultation_summary/email.ts:23,29-38` vs `send-summary/route.ts:77-98` (no `rxPdf*` passed) | Attach the PDF or remove the "attached as PDF" copy |
| **Folder-only stubs**: insurance report, fitness-to-work, disability, transfer summary, referral template | `DocumentsSidebar.tsx:76-101`; only creatable via free-text Helena chat | Build dedicated creators or hide the folders |

### P1-2 · medical-codes (ICD-10/CPT) — hallucination + safety-rule gap
`app/api/consultations/[id]/medical-codes/route.ts:84` does **not** inject the `CLINICAL_TRANSCRIPT_BOUNDARY_RULES` that SOAP/summary use (anti-cross-patient / anti-fabrication), and the LLM-generated codes are persisted with **no validation against any ICD-10/CPT registry**. Billing/record risk.
**Fix:** add boundary rules to the prompt; validate generated codes against a reference set and flag unknowns.

### P1-3 · Payment is a disabled "Coming Soon" stub — no monetization path on booking
`components/booking/BookingForm.tsx:335-344` renders a `pointer-events-none` "Coming Soon" / "Segera Hadir" block. Razorpay subscription billing exists for the *doctor* plan, but **patient booking cannot collect payment**. Note: billing is also effectively free for all doctors today — every invite claim auto-grants 30-day Pro (`20260428060000_invite_claim_grants_pro.sql:78-86`, `api/auth/signup/route.ts:224-235`).
**Fix (decide):** wire patient-booking payment, or remove the stub and ship booking as free for now (explicit decision, not a dead button).

### P1-4 · KKI (Indonesia doctor registration) is a stub — entire ID market unverified
`lib/integrations/kki.ts:13-24` always returns `{verified:"pending"}`; `StepRegistration.tsx:71-81` accepts any ≥5-char string as a "registration." India's NMC path is real. So Indonesian doctor credentials are never verified — a compliance gap for ID GA.
**Fix:** real KKI verification (or manual-review queue + clear "pending verification" UX), and gate clinical features until verified.

### P1-5 · WhatsApp send is "Coming Soon"
`components/consultation/ConsultationResults.tsx:485-496` — disabled button + badge. Gupshup WhatsApp *is* wired server-side (`lib/notify/whatsapp.ts`); the UI just isn't connected.
**Fix:** wire the button to the existing notify path, or hide it.

### P1-6 · Hardcoded English leaks into the Indonesian (`id`) locale
The message files are healthy (1030/1030 keys parity), but these components bypass `next-intl` with hardcoded English shown in `id`:
`LanguageSelector.tsx` (start of every consult), `free-tier-exhausted-modal.tsx`, `dashboard/next-patient-card.tsx`, `calendar/CalendarPage.tsx`, `calendar/BookingPageTab.tsx`, `intake-template-builder.tsx`, `Sidebar.tsx`/mobile nav ("Issues"/"More"), and patient-detail satellites (`patient-narrative-card.tsx`, `ask-ai-fab.tsx`, `flagged-follow-up-alert.tsx`).
**Fix:** move strings into `messages/{in,id}.json` and use `useTranslations`.

### P1-7 · Missing legal pages — can't sell a medical SaaS without them
`landing/src/components/Footer.tsx:181` links to `/privacy`, but **no `/privacy` page exists**, and there is **no `/terms`** anywhere. Both are table-stakes for clinic sales / "HIPAA-ready" claims.
**Fix:** add real Privacy Policy + Terms of Service pages.

### P1-8 · Raw DB errors + PHI leak to client / logs
- Raw `error.message`/`stack` returned to clients across admin `issues/*`, `analytics/*`, user `issues/*`, `consultations/start:107,131`, and public lookups (`formulary/search`, `medicines/search`, `nmc/lookup`, `kki/lookup`). Violates the project's `{error, code}` rule.
- PHI in logs: `consultation/transcribe/route.ts:31-92`, `translate/route.ts:27` `console.error` transcript text previews.
**Fix:** structured `{error: code}` responses; strip PHI from logs / gate behind a debug flag.

### P1-9 · Silent async failures with no error UI
No error state (errors swallowed to console): patient-detail tabs `HealthRecordsView.tsx:51-56`, `ConsultationsView.tsx:51-56`, `PrescriptionsView.tsx:62-67`; admin issue detail spins forever on fetch failure (`admin/(authed)/issues/[id]/page.tsx:37-41`); booking `SlotPicker.tsx:66-70` shows a silent empty grid.
**Fix:** add error states distinguishable from empty.

---

## P2 — Hardening, cleanup, deployment hygiene

### Security hardening
- `patient-portal/next.config.ts:25` CSP allows `'unsafe-eval' 'unsafe-inline'` on a patient-PII app — tighten to nonce/hash.
- Patient storage uploads aren't path-scoped to the uploader's own appointment (`AppointmentActions.tsx:74-77` + loose bucket policy `RLS-POLICIES-NEEDED.md:107-124`) — scope `patient-documents` bucket RLS per patient.
- `api/webhooks/msg91/route.ts` is unsigned/unverified — add a shared-secret or IP allowlist.
- `api/consultation/soap-demo` + `prescription-demo` are unauthenticated LLM endpoints with no rate limit (cost/abuse) — add IP rate-limiting.

### Dead code / dead config (remove to shrink attack surface + confusion)
- `lib/ai/claude.ts` (disabled) + `claude.test.ts` — delete.
- Orphaned STT: `api/transcribe/` (AssemblyAI, no callers), `api/consultations/[id]/transcribe/` (no callers), `api/consultation/streaming-session/` (stub, no callers), `api/openai/transcribe/` (no callers). **Speechmatics** dep has zero imports. (Note: CLAUDE.md lists AssemblyAI/Speechmatics as "fallbacks" — they are nominal only; not actually wired as fallbacks.)
- `app/.env.example`: remove dead `INNGEST_*` and `CLAUDE_SERVICE_*`; **add** the referenced-but-missing `OPENAI_API_KEY`, `STT_PROXY_SECRET`, `ANALYTICS_IP_SECRET`.
- `app/APPLY_MIGRATIONS.sql` — stale ad-hoc file with a **wrong `language CHECK (IN 'en','ar')` constraint** (Arabic, not India/Indonesia) and duplicates numbered migrations. **Do not run it.** Delete or mark superseded.
- `larinova_medicines` seed = 20 mock rows (`20260123184843...sql:419`); real formulary uses `lib/formulary/india`, so the DB table is vestigial — confirm and drop or repurpose.
- `lib/notify/issue-filed-email.ts:3` fallback sender is `larinova@contact.raxgbc.co.in` (violates "always hello@larinova.com") — change default.

### Email sender hygiene
- Confirm `EMAIL_FROM=hello@larinova.com` set in prod for all three apps (masks the raxgbc fallback above).

---

## Deployment checklist (do before flipping public)

1. **Apply + verify the RLS fix migration on the production Supabase project.** Then audit live policies (`pg_policies`). This gates everything.
2. **Confirm all numbered migrations are applied to prod** — no in-repo ledger exists. Critically `20260423103800` (portal RLS) and `20260428060000` (pro grant). `select name from supabase_migrations.schema_migrations order by name;` and diff against `app/supabase/migrations/`.
3. **Wire the Razorpay webhook** in the dashboard (URL → `/api/razorpay/webhook`, secret → `RAZORPAY_WEBHOOK_SECRET`). It is the *only* Pro-activation path; `/verify` does not persist.
4. **Ensure `SIMULATE_RAZORPAY` and `SIMULATE_NOTIFY` are UNSET**, and `NODE_TLS_REJECT_UNAUTHORIZED` ≠ `0` in prod.
5. **Set all required secrets** (full inventory below). Configure **Supabase Auth SMTP** — doctor/patient login is OTP email via Supabase's mailer (not Resend); the default mailer is rate-limited and will throttle sign-ins at launch.
6. **Verify the Resend `larinova.com` domain** (DKIM) and that the Supabase Storage bucket `patient-documents` exists (referenced by RLS, not created by any migration).
7. `landing/` has **no `.env.example`** — ensure `SUPABASE_SERVICE_ROLE_KEY` + `RESEND_API_KEY` are set on that deployment or the discovery survey 503s.

### Required env vars (app/)
Public: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_PATIENT_PORTAL_URL`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `NEXT_PUBLIC_STT_STREAMING`.
Secret: `SUPABASE_SERVICE_ROLE_KEY`, `SARVAM_API_KEY`, `DEEPGRAM_API_KEY`, `RESEND_API_KEY`, `RAZORPAY_KEY_ID/_KEY_SECRET/_WEBHOOK_SECRET` (+ plan IDs), `MSG91_AUTH_KEY`, `GUPSHUP_API_KEY/_WEBHOOK_SECRET`, `STT_PROXY_SECRET`, `ANALYTICS_IP_SECRET`, (`OPENAI_API_KEY` only if keeping the Whisper route).

---

## What's actually solid (don't touch)

- **Auth helpers consistent + correct.** `requireAdmin()` on all 11 admin routes; OTP-only doctor signup (no passwords); portal magic-link with server-verified `getUser()` gate.
- **Razorpay crypto is correct.** HMAC-SHA256 webhook verify with constant-time compare, idempotency via unique-key insert, Pro granted only from verified webhook events (never client callback).
- **`larinova_documents` + portal admin paths are properly doctor/patient-scoped in code** (don't rely on the broken RLS).
- **Clinical AI is well-designed.** Real Sarvam `sarvam-m` inference; strong anti-fabrication SOAP/summary prompts; **AI never writes a dispensed prescription** — production prescriptions are manual formulary entry only, so the "invented medicines" P0 from the spec is structurally avoided.
- **Landing is honest + production-grade** apart from the missing legal pages — real CTAs to `app.larinova.com`, no fake testimonials/stats, strong CSP.
- **Patient portal** auth + ownership checks are correct; the only thing blocking it is the shared-DB RLS (P0-1).

---

## Recommended execution order

**Phase 1 — stop the bleeding (P0, ~days):**
P0-1 RLS migration + P0-2 route guards → P0-3 recording keepalive/reconnect → P0-4 diarize transaction → P0-5 visible AI failures → P0-6 fix/trim tests → P0-7 lazy Resend init + lint script.

**Phase 2 — make it sellable (P1):**
P1-1 unified cert renderer + signature + send-document route → P1-7 legal pages → P1-6 i18n leaks → P1-3/P1-4 decide payment & KKI → P1-2 ICD validation → P1-8/P1-9 error handling.

**Phase 3 — harden + clean (P2):**
CSP, storage scoping, webhook verification, rate limits, dead-code removal, env hygiene, deployment checklist.

> Routing note (per workspace policy): non-UI fixes (RLS/migrations, route guards, STT hooks, build/test config, integrations) → Codex; UI fixes (cert renderer, i18n strings, error states, legal pages, signature capture) → Claude.
