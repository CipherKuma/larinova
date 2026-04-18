# Unified Offer Fix — Standardize to "1 Month Free, Full Access"

We are standardizing ALL messaging across the landing page and MVP web app to one consistent offer:

**"1 month free, full access, no credit card required."**

No more "14 days", no more "3 AI generations", no more "forever free". One offer everywhere.

Our email is `hello@larinova.com` and our domain is `larinova.com`.

---

## PART 1 — LANDING PAGE (`landing/`)

### File: `landing/src/data/locale-content.ts`

**INDIA (`in`) locale changes:**

1. `nav.cta`: Change `"Start Free Trial"` → `"Try Free for 1 Month"`
2. `hero.ctaPrimary`: Change `"Start Free Trial"` → `"Try Free for 1 Month"`
3. `pricing.free.period`: Change `"for 14 days"` → `"for 1 month"`
4. `pricing.free.features[0]`: Change `"50 consultations included"` → `"Unlimited consultations"`
5. `pricing.free.cta`: Change `"Start Free Trial"` → `"Start 1 Month Free"`
6. `finalCta.cta`: Change `"Start Free Trial"` → `"Start 1 Month Free"`
7. `finalCta.note`: Change `"No credit card required / 14-day free trial / Cancel anytime"` → `"No credit card required · 1 month free · All features included"`
8. `mobileCta`: Change `"Start Free Trial - 14 days free"` → `"Try Free for 1 Month — All Features"`

**INDONESIA (`id`) locale changes:**

1. `nav.cta`: Change `"Mulai Uji Coba Gratis"` → `"Coba Gratis 1 Bulan"`
2. `hero.ctaPrimary`: Change `"Mulai Uji Coba Gratis"` → `"Coba Gratis 1 Bulan"`
3. `pricing.free.period`: Change `"selama 14 hari"` → `"selama 1 bulan"`
4. `pricing.free.features[0]`: Change `"50 konsultasi termasuk"` → `"Konsultasi tanpa batas"`
5. `pricing.free.cta`: Change `"Mulai Uji Coba Gratis"` → `"Mulai Gratis 1 Bulan"`
6. `finalCta.cta`: Change `"Mulai Uji Coba Gratis"` → `"Mulai Gratis 1 Bulan"`
7. `finalCta.note`: Change `"Tidak perlu kartu kredit / Uji coba 14 hari / Batal kapan saja"` → `"Tidak perlu kartu kredit · Gratis 1 bulan · Semua fitur termasuk"`
8. `mobileCta`: Change `"Mulai Uji Coba Gratis - 14 hari gratis"` → `"Coba Gratis 1 Bulan — Semua Fitur"`

**DO NOT change** anything in the discovery survey page (`landing/src/app/[locale]/discovery-survey/page.tsx`) — it already says "1 Month Free" / "Gratis 1 Bulan" everywhere. Leave it as-is.

---

## PART 2 — MVP WEB APP (`mvp-web-app/`)

### File: `mvp-web-app/messages/in.json` — billing section

1. `billing.foreverFree`: Change `"Forever free"` → `"1 Month Free Trial"`
2. `billing.aiSummariesFree`: Change `"3 AI summary generations"` → `"Unlimited AI summaries"`
3. `billing.medCodesFree`: Change `"3 medical code generations"` → `"Unlimited medical codes"`
4. `billing.medGptFree`: Change `"3 MedicalGPT conversations"` → `"Unlimited MedicalGPT"`
5. `upgradeModal.description`: Change `"You've used all {limit} free trials for {feature}. Upgrade to Pro for unlimited access to all AI features."` → `"Your 1-month free trial has ended. Upgrade to Pro to continue unlimited access to all AI features."`

### File: `mvp-web-app/messages/id.json` — billing section

1. `billing.foreverFree`: Change `"Gratis selamanya"` → `"Uji Coba Gratis 1 Bulan"`
2. `billing.aiSummariesFree`: Change `"3 pembuatan ringkasan AI"` → `"Ringkasan AI tak terbatas"`
3. `billing.medCodesFree`: Change `"3 pembuatan kode medis"` → `"Kode medis tak terbatas"`
4. `billing.medGptFree`: Change `"3 percakapan MedicalGPT"` → `"MedicalGPT tak terbatas"`
5. `upgradeModal.description`: Change `"Anda telah menggunakan semua {limit} uji coba gratis untuk {feature}. Tingkatkan ke Pro untuk akses tak terbatas ke semua fitur AI."` → `"Uji coba gratis 1 bulan Anda telah berakhir. Tingkatkan ke Pro untuk melanjutkan akses tak terbatas ke semua fitur AI."`

### File: `mvp-web-app/types/billing.ts`

Change the `FREE_TIER_LIMITS` to be generous for the 1-month trial period. We'll enforce the 30-day window separately later — for now, make the limits high enough that no one hits them during their first month:

```typescript
export const FREE_TIER_LIMITS: Record<AIFeature, number> = {
  summary: 10000,
  medical_codes: 10000,
  helena_chat: 10000,
};
```

### File: `mvp-web-app/lib/resend/email.ts`

1. Change the fallback email on line 26: `"onboarding@resend.dev"` → `"hello@larinova.com"`
2. Change the header tagline in the email template (line 203): `"Zero-Knowledge AI Medical Platform"` → `"AI Medical Scribe for Doctors"`
3. Change the footer tagline (line 287): `"Larinova - Zero-Knowledge AI Medical Platform"` → `"Larinova — AI Medical Scribe"`

---

## PART 3 — VERIFICATION

After making all changes:

1. Search the entire `landing/` directory for any remaining instances of `"14 day"`, `"14-day"`, `"14 hari"` — there should be ZERO
2. Search the entire `mvp-web-app/` directory (excluding `node_modules/` and `_archive/`) for `"forever free"`, `"forever Free"`, `"gratis selamanya"` — there should be ZERO
3. Search for `"Zero-Knowledge"` in `mvp-web-app/` — there should be ZERO
4. Search for `"3 AI"`, `"3 medical"`, `"3 MedicalGPT"`, `"3 pembuatan"`, `"3 percakapan"` in `mvp-web-app/messages/` — there should be ZERO
5. Confirm `hello@larinova.com` appears as the fallback email in `lib/resend/email.ts`

Report what you changed and the verification results.
