# Bala Feedback Fixes

## Goal

Address Balachandar Seeman's 2026-04-30 WhatsApp feedback from mobile testing of the live India doctor app.

## Decided

- Source evidence is archived at `ops/sales/bala-feedback/2026-04-30/`.
- Start with high-confidence functional bugs: duplicated tasks and booked appointments missing from Consultations/dashboard.
- Treat OTP tab-switch refresh, medication confirmation, structured certificate input, and onboarding button placement as separate follow-up surfaces unless the root cause is small and local.
- Do not overwrite unrelated in-progress PWA/mobile shell changes already present in the worktree.

## Open

- Whether appointment booking should create a consultation row immediately, or whether Consultations/dashboard should read pending appointments directly.
- Whether task duplication is client double-submit, API retry, duplicate insert logic, or existing duplicate data.
- Whether live verification can run against an authenticated doctor session without disturbing Bala's account.

## Out of scope

- Full medication-prescription workflow redesign.
- Full medical certificate structured-form redesign.
- Any destructive production cleanup without explicit target confirmation.

## Done When

- Root causes are documented for each bug touched.
- Focused code changes and regression coverage are added for fixed bugs.
- `pnpm build` and relevant tests pass from `app/`.
- Browser proof is captured for changed UI routes if UI behavior changes.
