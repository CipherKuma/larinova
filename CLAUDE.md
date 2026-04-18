# Larinova

AI medical scribe for doctors in India and Indonesia. Records doctor-patient consultations in the local language, then auto-generates SOAP notes, ICD-10 codes, and prescriptions.

## Brand

- **Name**: Larinova (formerly Kosyn — all Kosyn references are archived in `_archive/deprecated-kosyn/`)
- **Domain**: larinova.com
- **Emails**: hello@larinova.com (primary), contact@larinova.com (secondary)
- **Tagline**: "AI Medical Scribe for Doctors"
- **Founder**: Gabriel Antony Xaviour

## Directory Structure

```
larinova/
├── CLAUDE.md                       ← You are here
├── landing/                        ← Marketing website (Next.js)
├── mvp-web-app/                    ← Core product app (Next.js + Supabase)
├── docs/                           ← Strategy & implementation docs
│   ├── SALES_OUTREACH_PLAN.md      ← Sales strategy + outreach templates
│   ├── CLAUDE_CODE_PROMPT.md       ← Messaging fix implementation prompt
│   ├── PRICING_IMPLEMENTATION_INSTRUCTIONS.md  ← Future tiered pricing (Month 2-3)
│   └── Competitive_Research_Report.html        ← Competitor analysis
├── sales/                          ← Sales materials & leads
│   ├── pitch-decks/                ← 6 PDFs (3 segments × EN + ID)
│   ├── discovery-forms/            ← Printable doctor survey forms (EN + ID)
│   ├── indonesia_leads.xlsx        ← ~50 hospital leads
│   └── Larinova_Launch_Playbook.docx ← Personal launch instructions
├── logo-gen/                       ← Brand logos and icons
├── command-center/                 ← AI agent skills (marketing, strategy)
├── _archive/deprecated-kosyn/      ← Old brand files (PII redacted)
├── .agents/                        ← Dev best-practice skills (React, SEO, auth)
├── .claude/                        ← Claude Code settings
├── .mcp.json                       ← MCP server config (Context7)
└── cmux.json                       ← Dev workspace layout
```

## Architecture

### `/landing` — Marketing website
- **Stack**: Next.js (App Router), Tailwind CSS, TypeScript
- **Locale routing**: `/in` (India), `/id` (Indonesia)
- **Content**: All locale-specific text in `src/data/locale-content.ts` (exported as `Record<Locale, LandingContent>`)
- **Key routes**: `/[locale]` (landing page), `/[locale]/discovery-survey` (doctor survey form), `/book` (book a call), `/blog`
- **Discovery survey API**: `src/app/api/discovery-survey/route.ts` — sends confirmation email via Resend from hello@larinova.com
- **STT providers**: Sarvam AI (India), Deepgram (Indonesia)

### `/mvp-web-app` — Core product (app.larinova.com)
- **Stack**: Next.js (App Router), Supabase (auth + database), Tailwind CSS, next-intl for i18n
- **i18n messages**: `messages/in.json` (India), `messages/id.json` (Indonesia)
- **Billing**: `types/billing.ts` — `FREE_TIER_LIMITS`, `PLAN_PRICES` by region
- **Email**: `lib/resend/email.ts` — transactional emails via Resend API, sends from hello@larinova.com
- **Key features**: Voice recording → transcription → SOAP notes → ICD-10 coding → prescription generation
- **STT integration**: Deepgram (Indonesia), Sarvam AI (India), AssemblyAI, Speechmatics
- **Documents**: Auto-generated clinical documents (prescriptions, referral letters) with PDF export via html2pdf.js

### `/_archive/deprecated-kosyn/` — Archived files
Old brand (Kosyn) product docs and launch plans. PII has been redacted. Do not reference these in active code.

## Current Offer (April 2026)
- **One offer everywhere**: 1 month free, full access, no credit card
- **Indonesia launch**: Primary focus. Meeting doctors IRL, collecting testimonials, then cold outreach to ~50 hospital leads
- **India**: Secondary market, maintained but not actively launching

## Key Files
- `landing/src/data/locale-content.ts` — All landing page copy (both locales)
- `mvp-web-app/.env` — API keys (Supabase, Deepgram, Resend, OpenAI, Sarvam, Speechmatics)
- `mvp-web-app/types/billing.ts` — Pricing and free tier configuration
- `mvp-web-app/lib/resend/email.ts` — Email templates
- `docs/SALES_OUTREACH_PLAN.md` — Sales strategy and outreach templates
- `docs/CLAUDE_CODE_PROMPT.md` — Prompt used to fix messaging inconsistencies across the app
- `docs/PRICING_IMPLEMENTATION_INSTRUCTIONS.md` — Complete instructions for tiered pricing (use in Month 2-3)
- `docs/Competitive_Research_Report.html` — Competitor analysis and pricing benchmarks

## Conventions
- All user-facing CTA buttons should link to `https://app.larinova.com` (not `#pricing` or `#`)
- Email sender: `hello@larinova.com` everywhere (no `noreply@`, no `onboarding@resend.dev`, no `raxgbc.co.in`)
- Domain: `larinova.com` (not `larinova.id`)
- Indonesian text should always be accompanied by English translations in internal docs
