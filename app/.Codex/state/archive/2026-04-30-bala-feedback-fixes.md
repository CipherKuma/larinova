# Bala Feedback Fixes

## Goal

Address Balachandar Seeman's 2026-04-30 WhatsApp feedback from mobile testing of the live India doctor app.

## Decided

- Source evidence is archived at `ops/sales/bala-feedback/2026-04-30/`.
- Treat OTP tab-switch refresh, onboarding button placement, medication confirmation, medical certificate creation, task duplication, and schedule visibility as separate fix surfaces.
- Preserve unrelated dirty work while landing each verified fix.

## Done

- OTP reload state and onboarding action spacing were already shipped in earlier commits.
- Medication confirmation and task duplication were already shipped in earlier commits.
- This pass finalized the schedule visibility work, cleaned app debug leftovers, and stabilized Playwright webServer/auth helpers.
- `pnpm build` passed.
- `pnpm exec vitest run lib/appointments/schedule.test.ts` passed.
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3002 pnpm exec playwright test tests/e2e/dashboard.spec.ts --project=chromium --grep "today's confirmed appointment"` passed.
