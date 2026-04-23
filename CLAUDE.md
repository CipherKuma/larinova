# Larinova

AI medical scribe for doctors in India and Indonesia. Records doctor-patient consultations in the local language, then auto-generates SOAP notes, ICD-10 codes, and prescriptions.

**This repo is code-only.** All non-technical material (strategy, sales, collateral, pricing docs, logo gen, ops CLIs) lives in the sibling dir `~/Documents/products/larinova-ops/`. That split exists so ops-side MCPs (Gmail, WhatsApp) don't bleed into coding context. See `../larinova-ops/CLAUDE.md`.

## Brand
- **Name**: Larinova (formerly Kosyn)
- **Domain**: larinova.com
- **Emails**: hello@larinova.com (primary), contact@larinova.com (secondary)
- **Tagline**: "AI Medical Scribe for Doctors"
- **Founder**: Gabriel Antony Xaviour

## Directory structure
```
larinova/
├── CLAUDE.md                ← you are here
├── AGENTS.md                ← installed CLIs + scripts for agents
├── README.md
├── cmux.json                ← dev workspace layout
├── landing/                 ← marketing site (Next.js, has its own CLAUDE.md)
├── app/                     ← product app (Next.js, has its own CLAUDE.md)
├── patient-portal/          ← patient.larinova.com (Next.js)
├── docs/                    ← technical docs only
│   └── superpowers/         ← spec docs, plans, launch evidence
├── .claude/                 ← Claude Code state (spec, skills, tdd-guard)
└── .mcp.json                ← Context7 only (code-focused)
```

## Sibling dir (non-technical)
```
../larinova-ops/
├── strategy/                ← INDONESIA_PLAYBOOK, INDIA_PLAYBOOK, GO_TO_MARKET, etc.
├── sales/                   ← decks, discovery forms, leads
├── collateral/              ← marketing assets
├── logo-gen/                ← brand logos
├── docs/                    ← SALES_OUTREACH_PLAN, PRICING_IMPL, Competitive_Research,
│                             india/ + indonesia/ pricing-strategy HTML/PDF
├── whatsapp/                ← whatsapp-web.js CLI (pair/send/list)
├── .mcp.json                ← local Gmail MCP (scoped to gabrielantony56@gmail.com)
└── CLAUDE.md
```

When a strategy doc or sales artifact needs to land in code (pricing changes, whitelist updates, landing copy), `cd` back into this repo to make the edit. Conversely, when code decisions affect positioning or outreach, update the relevant doc in `../larinova-ops/`.

## Current focus (April 2026)
- **Indonesia launch** — primary. Meeting doctors IRL, collecting testimonials, then cold outreach to ~50 hospital leads.
- **India** — secondary market, maintained but not actively launching.
- **Offer**: 1 month free, full access, no credit card. Same everywhere.
- **Active spec**: `docs/superpowers/specs/2026-04-23-india-opd-platform-design.md`.

## Conventions
- Every user-facing CTA links to `https://app.larinova.com` (never `#pricing` or `#`).
- Email sender is always `hello@larinova.com` — never `noreply@`, `onboarding@resend.dev`, or `raxgbc.co.in`.
- Canonical domain is `larinova.com` (not `larinova.id`).
- Any Indonesian text in internal docs must carry an English translation alongside.

## Per-subdir context
When working inside `landing/`, `app/`, or `patient-portal/`, Claude Code auto-loads that subdir's `CLAUDE.md`. Read it first — stack, routes, and conventions live there.

## Strategy docs
All strategy and sales material has moved to `../larinova-ops/`. See its `CLAUDE.md` for the index.
