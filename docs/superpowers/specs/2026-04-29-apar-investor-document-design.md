# Investor Doc — Sundar Venkatraman (APAR Innosys LLP)

**Owner:** Gabriel Antony Xaviour
**Date:** 2026-04-29
**Status:** Spec locked. In production. Target delivery: **Friday 2 May 2026, 6 PM IST.**
**Output dir:** `ops/sales/sundar-pitch/`

---

## 1. Goal

Produce a **deck + memo + 2 appendices** that Sundar Venkatraman — CEO of APAR Innosys LLP and longstanding Rax Tech client — can read, share with his CA / wife / advisor, and use to commit to a **₹75L for 10% equity** angel cheque in Larinova Pvt Ltd at a ₹7.5 Cr post-money valuation.

## 2. Why this investor specifically

Sundar is **not a cold investor**. He has commercially transacted with Gabriel's family for years (APAR Innosys distributes / resells products made by Rax Tech, Gabriel's parents' ₹20–40 Cr/yr IoT and e-surveillance company). The pre-existing trust transfer from father → son is already in place. Sundar's investor profile is **A + C** (industrial / strategic CEO + patron / network angel) — he cares about: unit economics, founder character, "is this kid serious," clean cap table. He does NOT care about: TAM pyramid slides, AI futurology, exit math.

## 3. What we're shipping (locked)

| Artifact | Format | Length | Purpose |
|---|---|---|---|
| **deck.pdf** | A4 portrait, 12 pages | 12 slides | Sundar's first read; flips through in 10 minutes |
| **memo.pdf** | A4 portrait | 8 pages of prose | Shares with CA / wife / advisor for diligence |
| **cap-table-appendix.pdf** | A4 portrait | 1 page | Pre + post round share allotment math |
| **use-of-funds-appendix.pdf** | A4 portrait | 1 page | ₹75L line-item breakdown over 22 months |

**Build stack:** HTML → weasyprint → PDF, matching `ops/docs/` precedent.
**Visual palette:** deep navy (#0d3349) primary + Larinova orange (#B84E18) secondary, Inter font, A4 portrait.

## 4. The ask (locked, do not re-litigate)

- **₹75 Lakh for 10% equity → ₹7.5 Cr post-money valuation**
- 22 months of runway at ~₹3.4L/mo blended burn (incl. founder + travel + infra + first hire)
- Negotiation floor: **₹4 Cr post-money minimum** (we will not go below)
- Authorised capital must be increased from ₹1L → ~₹10L via SH-7 filing before allotment (~7-10 days, routine)
- Pre-existing money pipes: current account + GST registration in flight, expected to close before funds land

## 5. The story spine (used in BOTH deck and memo)

1. **Problem** — Indian doctors lose 90 min/day to documentation. Tamil-speaking patients lose clinical fidelity to English EMRs.
2. **Solution** — Larinova: end-to-end OPD platform (booking → AI intake → 60-sec Prep Brief → multilingual scribe → wellness follow-up) in Tamil/Hindi/English, ABDM-native.
3. **Where we stand today (Day 7 since incorporation)** — 5 alpha doctors active, 2-3 hospital onboardings inbound, full product live, Pricing locked.
4. **Product** — live screenshots from `app.larinova.com` proving the consult flow.
5. **Market** — 1.1M doctors in India (Eka.Care has ~65K, English/Hindi only). 180K+ doctors in Indonesia (zero AI-scribe competitor).
6. **Business model** — ₹999/mo Pro per doctor, ~85% gross margin SaaS. Free tier (20 consults/mo) for top-of-funnel.
7. **Competition + Moat** — Eka.Care comparison table (Tamil moat + full-stack + 10% under price). Global comparison: Larinova is **82-99% cheaper** than Nuance / Suki / Abridge per doctor.
8. **Indonesia (the second engine)** — Bahasa-native, zero competitors, parallel landing live. Validated cross-border thesis without diluting India focus.
9. **12-month roadmap** — clear, conservative milestones Sundar can hold us to.
10. **Team + family context** — Gabriel solo full-time AI-augmented; 70+ hackathon wins; production work for RPS AI (SF, Orange DAO + Delphi Ventures backed), Marlin Protocol (Dubai TEE infra), Rax Tech (family). Father as 10% governance shareholder, no operational role.
11. **Risks + mitigations** — honest 5-row table.
12. **The ask** — ₹75L for 10% at ₹7.5 Cr post, what it buys, what it commits us to.

## 6. Memo structure (8 pages)

1. Executive summary (1 page)
2. Problem + market (1 page)
3. Solution + product (1 page)
4. Where we stand today + 12-month roadmap (1 page)
5. Business model + unit economics (1 page)
6. Competition + moat (1 page)
7. Team + cap table + family context (1 page)
8. The ask + use of funds + risks + closing (1 page)

## 7. Bio (locked content, used in both)

Gabriel Antony Xaviour, 22, founder & CEO. **LICET, B.E. Electronics & Communication (2024).** **70+ hackathon wins in 4 years** — top-decile competitive product builder in India. Production work for **RPS AI** (San Francisco; Founding Engineer; backed by Orange DAO + Delphi Ventures + TRIVE Singapore + UF Venture), **Marlin Protocol** (Dubai; Solutions Engineer; trusted execution environments / privacy compute), **Rax Tech** (Chennai; family company doing ₹20–40 Cr/yr in IoT + e-surveillance). Solo, full-time, AI-augmented from day one. Tamil-speaking, Chennai-based. Multi-decade builder mission.

## 8. Cap table (locked)

| Holder | Pre-round | Post-round (₹75L for 10%) |
|---|---|---|
| Gabriel Antony Xaviour (founder, CEO) | 90% | 81% |
| Antony Xaviour (father, governance only) | 10% | 9% |
| Sundar Venkatraman (new investor) | — | 10% |
| **Total** | **100%** | **100%** |

Bala (Balachandar Seeman) on structured ambassador commission (₹1,500/activation + ₹2,500/paid + ₹25K clinic bonus), **no equity**.

## 9. Use of funds (locked, ₹75L over 22 months)

| Bucket | Amount |
|---|---|
| Founder runway (₹1L/mo × 22) | ₹22L |
| Hospital BD travel + Bala commissions | ₹10L |
| Indonesia market entry | ₹8L |
| Marketing + content + Higgsfield videos | ₹6L |
| AI inference + infra (Sarvam, Anthropic, Supabase, Vercel) | ₹6L |
| Compliance + legal (GST, DPDP, HPR, MSME, ToS, SH-7) | ₹4L |
| Tools + subscriptions | ₹3L |
| First strategic hire month 9-12 | ₹12L |
| Buffer | ₹4L |
| **TOTAL** | **₹75L** |

## 10. Risks slide (locked)

| Risk | Mitigation |
|---|---|
| Eka.Care adds Tamil | Tamil-native from day 1; deeper ABDM moat + full OPD stack they don't have; first-mover with Tamil clinics |
| Solo founder bus factor | Raise funds first strategic hire by month 9; AI augmentation already de-risks single-person execution |
| Doctor adoption slow / habit-resistant | Co-build weekly with 5 alpha doctors; free trial removes friction; ambassador program creates peer pull |
| Indonesia regulatory delays (SatuSehat / BPJS) | India is primary, Indonesia is upside not load-bearing |
| AI infra costs scale faster than revenue | ~85% gross margin even at ₹999/mo; Claude Service caps unit cost; free vs Pro tier controls runaway usage |

## 11. Honesty rules (non-negotiable)

- **No fabricated metrics.** Day-7 reality only: 5 active alpha doctors, 0 paying yet, full product live, hospital pipeline. Inflating these to a Rax Tech client invites both relationship damage and securities-law exposure.
- **No claims about features that aren't live.** SMS + WhatsApp follow-up are deferred — say so.
- **All external facts (RPS AI investors, hackathon count, Marlin role, Rax Tech revenue) verified before publishing.** "70+" used instead of exact 75 for conservative framing.

## 12. Production timeline

| When | What |
|---|---|
| **Wed 29 Apr (today)** | Spec written + committed; deck/memo/appendices drafted; Gabriel sends interim WhatsApp to Sundar |
| **Thu 30 Apr** | Gabriel reviews v1 PDFs; iteration on copy + facts |
| **Fri 2 May AM** | Final polish, fact-check pass |
| **Fri 2 May 6 PM IST** | PDFs sent to Sundar via WhatsApp + email |

## 13. Definition of done

- All 4 PDFs render cleanly via weasyprint
- Bio facts verified (RPS AI investors, Marlin role, hackathon count framed conservatively)
- No fabricated usage metrics anywhere
- Cap table math checks out (90/10 → 81/9/10)
- Use of funds totals ₹75L exactly
- Gabriel has reviewed all 4 PDFs end-to-end before send
- Interim WhatsApp to Sundar sent today

## 14. Out of scope for this artifact

- Term sheet (Sundar's lawyer drafts, we counter)
- Shareholders agreement
- Board composition negotiation
- Razorpay Live wiring (separate workstream)
- Any update to the strategy docs (`ops/CLAUDE.md`, `GO_TO_MARKET.md`) — flagged separately
