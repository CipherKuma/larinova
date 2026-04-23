# Launch Evidence — India OPD Platform

> Captures Lighthouse scores, deploy verifications, and pilot smoke-test evidence required by §15 Definition of Done.

## PWA — §15.4

### Status: PASS — Lighthouse PWA 100

**Stack**
- `app/public/manifest.webmanifest` (Larinova identity, #0b0b0f theme, standalone portrait, 192 / 512 / 512-maskable icons)
- `app/public/icons/` — 192 / 512 / 512-maskable / 180 Apple
- `app/app/[locale]/layout.tsx` — `<link rel="manifest">`, apple-touch-icon, apple-mobile-web-app-*, theme-color, `<SwRegister />` client component
- `app/next.config.ts` — wrapped with `@serwist/turbopack` (moved off `next-pwa@5` which is webpack-only and silently no-ops under Next 16 Turbopack)
- `app/app/sw.ts` — Serwist service worker (defaultCache + /offline fallback for document navigations)
- `app/app/serwist/[path]/route.ts` — route handler that serves the compiled SW at `/serwist/sw.js` (includes `service-worker-allowed: /` so scope stays root)
- `app/components/pwa/sw-register.tsx` — client registration (`navigator.serviceWorker.register("/serwist/sw.js", { scope: "/" })`)
- `app/app/offline/page.tsx` — minimal dark offline page, precached at install
- `app/proxy.ts` matcher exempts `manifest.webmanifest`, `sw.js`, `workbox-*.js`, `fallback*.js`, `/serwist/…`, and `/offline` from the intl/auth chain

### Lighthouse run log

**2026-04-23 — localhost:3000/in, mobile form-factor, Lighthouse 11 (Lighthouse 13 dropped the PWA category)**

| Metric | Score |
|---|---|
| **PWA** | **100** |
| installable-manifest | pass |
| splash-screen | pass |
| themed-omnibox | pass |
| maskable-icon | pass |
| viewport | pass |
| content-width | pass |

Artifacts: `/tmp/pwa-lighthouse/in-pwa.report.html`, `/tmp/pwa-lighthouse/in-pwa.report.json`.

**Definition-of-done checks**
- `GET /manifest.webmanifest` → 200, `application/manifest+json` ✓
- `GET /serwist/sw.js` → 200, `application/javascript`, `service-worker-allowed: /` ✓
- `GET /offline` → 200 (precached as fallback for document requests) ✓
- Manifest + Apple meta live in `<head>` of locale layout ✓
- Indonesia landing files unchanged (grep-verified; see §13.4 below) ✓

---

## Indonesia landing — §13.4

### Status: verified untouched

- `landing/src/app/[locale]/page.tsx` — gates India-specific components behind `isIndiaOpd = l === 'in'`. `id` locale still renders `Hero` / `HowItWorks` / `Features` / `Pricing` exactly as before. Only net change affecting `id`: `<Toaster position="bottom-right" theme="dark" />` mounted globally (locale-independent, non-visual in default state).
- `landing/src/data/locale-content.ts` — fa518b5 diff is 100% additive (zero removed lines); `id` entries preserved.
- Original shared components `Hero.tsx`, `Features.tsx`, `Pricing.tsx`, `HowItWorks.tsx`, and id-data (`faqs-id.ts`, `blog-posts-id.ts`) have no touches across the 8 India-OPD / PWA commits: `fa518b5`, `6d1b713`, `86a787c`, `f2fef6c`, `a1104c8`, `e5dec71`, `db69f0c`, `b8a4b1e`.

---

## Scroll narrative audit (supporting evidence)

- `/tmp/pwa-landing-audit/` — 13 screenshots: hero + 5 phase viewports on 1440×900 desktop and 390×844 iPhone 13; pricing card desktop.
- Desktop alternates visual L/R per phase (BOOK right → INTAKE left → PREP right → CONSULT left → FOLLOW-UP right). Mobile stacks text-over-visual, each phase full viewport with min-h-screen.
- GSAP ScrollTrigger fires reliably (line draw → num/label → verb/noun → desc → visual), accent color rotates per phase. Hero word-stagger + breathing gradient work.
