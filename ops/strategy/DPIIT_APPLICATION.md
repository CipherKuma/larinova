# Larinova — DPIIT Recognition Application Packet

**Status:** Ready for filing prep; do not submit without Gabriel's explicit approval
**Last updated:** 2026-05-01
**Portal:** `https://www.startupindia.gov.in/content/sih/en/registration.html` → "Get Recognised" → DPIIT Recognition Form (Form 1)
**Expected outcome:** DPIIT certificate in 2–10 working days (free, ₹0 fee)
**Unlocks downstream:** AWS Activate ($300K), GCP Startups ($350K), Microsoft Founders Hub, Trademark 50% rebate (₹4.5K/class), 80-IAC tax holiday eligibility, IPR fast-track, self-certification under labour/env laws

---

## Pre-application checklist — what Gabriel needs to confirm

- [ ] Read this whole doc and approve / edit the three long descriptions below
- [ ] Confirm the registered email for the Startup India account: **`gabriel@larinova.com`** (proposed)
- [ ] Confirm the registered mobile for the Startup India account: **`+91 98844 50152`** (dad's phone — Aadhaar-linked, ensures OTPs land in one place)
- [ ] Confirm logo file path — proposed: `~/Documents/products/larinova/ops/brand/logos/dark-mode-icon-text.png`
- [ ] Confirm passport photo to upload — proposed: `~/Documents/products/larinova/ops/company-docs/_incoming/2026-04-30-incorporation-shortnames/photos/gabriel-passport-350x450.jpg`
- [ ] Confirm I should use `https://larinova.com` as the website link (not `app.larinova.com`)

---

## Section 1 — Entity Details

| Field | Value |
|---|---|
| Entity type | Private Limited Company |
| Name of entity | LARINOVA PRIVATE LIMITED |
| Date of incorporation | 22/04/2026 |
| Incorporation Number (CIN) | U62012TN2026PTC192444 |
| PAN | AAGCL8535J |
| TAN | CHEL10203E |
| Industry | Healthcare & Life Sciences |
| Sector (sub) | HealthTech / Digital Health Software |
| Industry NIC Code (primary) | **6201** — Computer programming activities |
| Industry NIC Code (secondary) | **6209** — Other information technology and computer service activities |
| Industry NIC Code (tertiary) | **8690** — Other human health activities |
| Registered office address | 4/2377, 60 Feet Road, Vijay Avenue 4th Street, Sithalapakkam, Tambaram, Kanchipuram, Tamil Nadu — 600126 |
| State | Tamil Nadu |
| District | Kanchipuram |
| Pincode | 600126 |
| Email | `gabriel@larinova.com` |
| Phone | `+91 98844 50152` |
| Website | `https://larinova.com` |
| Stage of startup | **Early Traction** *(5 pilot doctors actively using; pre-revenue but with paying-customer pipeline)* |

---

## Section 2 — Directors

| # | Name | Role | DIN | PAN | Mobile | Email |
|---|---|---|---|---|---|---|
| 1 | Gabriel Antony Xaviour | Director | 11680005 | DPDPG7678D | +91 98844 50152 | `gabriel@larinova.com` |
| 2 | Antony Xaviour | Director | 01646014 | AAAPX2735K | +91 98844 50152 | `antony@raxgbc.co.in` |

---

## Section 3 — Information about Startup

### A. Description of Startup *(150-250 words)*

Larinova is an end-to-end OPD (outpatient department) platform built specifically for Indian doctors. We orchestrate the entire patient journey around the consult — patients book online via a simple link, complete an AI-guided intake form before they arrive, and the doctor walks into the consultation already holding a 60-second AI-generated Prep Brief that highlights red flags from the patient's history and uploads. During the consultation itself, Larinova listens to the doctor-patient conversation in Tamil, Hindi, English, or any code-mixed combination, and generates structured SOAP notes, ICD-10 codes, and a signed prescription in real time — saving the doctor an average of 90 minutes of after-hours documentation work per day. After the visit, an automated dispatcher sends the consultation summary and prescription to the patient over email (SMS and WhatsApp arrive in v1.1), and a conversational wellness agent checks in with the patient on day 1, day 3, and day 7 to flag complications early. Larinova is currently being used in active alpha by five Chennai-based GPs, with the first paying customers being onboarded over the next quarter. Our pricing is built for solo and small-clinic practice — ₹999/month or ₹9,990/year for unlimited consultations — with a free tier covering 20 consultations a month so any doctor can start using us at zero cost.

*[~245 words. Edit any phrasing you want.]*

### B. What is the innovation? *(150-250 words)*

Existing AI medical scribes in India work only in English and Hindi, force the doctor to dictate after the patient has left, and stop at the consultation note — leaving booking, intake, prep, and follow-up scattered across separate tools. Larinova is the first platform to do three things together: (1) transcribe live doctor-patient consultations in Tamil, Hindi, English, and arbitrary code-mixed speech, leveraging India-native speech models (Sarvam AI) trained on Indian-language clinical vocabulary that western or English-Hindi-only models cannot match; (2) wrap the multilingual scribe inside a complete OPD orchestration layer — public booking page, AI-guided patient intake, a pre-consult Prep Brief that reads the patient's history and uploads, and post-consult automated wellness follow-up at days 1, 3, and 7; and (3) generate not just unstructured notes but properly structured SOAP notes, ICD-10 codes, and signed prescriptions in real-time — outputs that are clinically rigorous and ready for ABDM / ABHA integration. The combination is novel: no Indian competitor offers Tamil-native scribe + booking + intake + Prep Brief + follow-up in a single product, at solo-doctor pricing. The wellness follow-up agent in particular — a conversational AI that probes the patient's recovery, classifies replies, and only escalates to the doctor when something genuinely needs attention — is, to our knowledge, the first of its kind for Indian outpatient practice.

*[~240 words. Edit as needed.]*

### C. How will the business be scaled? Is it scalable? *(150-250 words)*

Larinova is a SaaS platform with near-zero marginal cost per consultation — every additional patient and doctor is incremental software usage, not incremental human labour. The economics scale linearly with doctor count: each doctor we onboard contributes ₹999/month in subscription revenue against a near-flat cost base of compute, AI inference, and infrastructure. India alone has approximately 1.1 million registered allopathic doctors, of whom roughly 600,000 are in solo or small-clinic OPD practice — our direct addressable market. At an average ARPU of ₹999/month and a conservative 10% market penetration over five years, that is roughly ₹720 crore in annualised recurring revenue from India alone. Geographic expansion follows the same SaaS playbook with no additional manufacturing or supply-chain overhead — Indonesia is our next market, with the same OPD landing already live in Bahasa Indonesia and the in-app product following once Deepgram tuning and a local patient portal are in place. Distribution scales through three compounding channels: (1) doctor referrals, since every paying doctor is a peer-network connector to other Indian-language doctors who are underserved by English-only EMRs; (2) a low-friction free tier (20 consultations/month) that requires zero credit card commitment and converts on usage; (3) clinic-level rollouts, where one onboarded doctor in a multi-doctor clinic naturally pulls the rest of the practice in. No additional hires, no inventory, no logistics — the product itself is the growth engine.

*[~250 words. Edit as needed.]*

---

## Section 4 — Intellectual Property Rights

| Item | Status |
|---|---|
| Patents (granted) | None |
| Patents (filed) | None — defer until defensible novelty surfaces |
| Trademarks (filed) | **None yet — will file Class 9 + 44 immediately after DPIIT cert lands (50% startup rebate)** |
| Copyrights (filed) | None — codebase auto-copyrighted under Berne Convention |
| Designs (filed) | None |

---

## Section 5 — Funding & Traction

| Item | Value |
|---|---|
| Total funds raised | ₹0 (bootstrapped) |
| Funding source(s) | Founder capital |
| Annual turnover (FY 2025-26) | ₹0 — incorporated 22 April 2026, no revenue |
| Number of employees | 0 (2 directors, no payroll yet) |
| Awards / Recognition received | None to date |
| Government grants received | None |
| Incubator / Accelerator association | None |

---

## Section 6 — Documents to Upload

All incorporation PDFs are staged at `ops/company-docs/_incoming/2026-04-30-incorporation-shortnames/` for upload.

| # | Document | Source path | Required |
|---|---|---|---|
| 1 | Certificate of Incorporation (CoI / SPICe+ approval) | `ops/company-docs/_incoming/2026-04-30-incorporation-shortnames/coi-spice-approval.pdf` | YES |
| 2 | PAN of Company allotment letter | `ops/company-docs/_incoming/2026-04-30-incorporation-shortnames/pan-050-allotment.pdf` (or `pan-882-allotment.pdf`) | YES |
| 3 | DIN Approval Letter — Gabriel | `ops/company-docs/_incoming/2026-04-30-incorporation-shortnames/din-approval-gabriel.pdf` | YES |
| 4 | MoA (INC-33) | `ops/company-docs/_incoming/2026-04-30-incorporation-shortnames/moa-inc-33.pdf` | YES |
| 5 | AoA (INC-34) | `ops/company-docs/_incoming/2026-04-30-incorporation-shortnames/aoa-inc-34.pdf` | YES |
| 6 | TAN allotment letter | `ops/company-docs/_incoming/2026-04-30-incorporation-shortnames/tan-allotment.pdf` | If asked |
| 7 | Name approval letter | `ops/company-docs/_incoming/2026-04-30-incorporation-shortnames/name-approval.pdf` | If asked |
| 8 | Board Resolution authorising Gabriel as DPIIT signatory | `ops/company-docs/_incoming/2026-04-30-incorporation-shortnames/board-resolution-dpiit-auth.pdf` *(draft exists as `.md`; signed PDF still needed)* | YES |
| 9 | Pitch deck (PDF) or product website | `https://larinova.com` | Optional — website link sufficient |
| 10 | Logo (rectangle, PNG) | `ops/brand/logos/dark-mode-icon-text.png` or `ops/brand/logos/light-mode-icon-text.png` | Optional but recommended |
| 11 | Logo (square icon, PNG) | `ops/brand/logos/dark-mode-icon-only.png` or `ops/brand/logos/light-mode-icon-only.png` | Optional but recommended |
| 12 | Founder photo (passport-size, 350x450) | `ops/company-docs/_incoming/2026-04-30-incorporation-shortnames/photos/gabriel-passport-350x450.jpg` | Optional |
| 13 | Founder photo (small, 200x230) | `ops/company-docs/_incoming/2026-04-30-incorporation-shortnames/photos/gabriel-passport-200x230.jpg` | If portal caps file size |

**TODO before Session 2:** Board Resolution draft exists as `board-resolution-dpiit-auth.md`; it needs meeting date filled, both directors' wet signatures, and a scanned PDF saved as `board-resolution-dpiit-auth.pdf` in the same folder.

---

## Section 7 — Self-Certification declarations *(checkboxes, no editing needed)*

These are auto-checked when submitting the form. We're attesting that:

- The startup is incorporated as a Private Limited Company (✓)
- Period of existence is up to 10 years from incorporation (we are at month 0 — ✓)
- Annual turnover has not exceeded ₹100 Cr in any FY (we are pre-revenue — ✓)
- The startup is working toward innovation, development, or improvement of products / services / processes, OR is a scalable business model with high potential for employment generation or wealth creation (✓ — covered in Section 3)
- The startup is not formed by splitting up or reconstructing an existing business (✓ — entirely new entity)

---

## Session 2 — Step-by-step (when Gabriel is at M2 Chrome with phone)

1. **I drive:** open `startupindia.gov.in/register`, click "Sign up", paste structured fields above
2. **You do:** type your `gabriel@larinova.com` Gmail password if Google sign-in is offered
3. **I drive:** request email + mobile OTP
4. **You do:** read mobile OTP from your phone, type into chat or directly into M2 Chrome window
5. **I drive (auto):** read email OTP from Gmail API, paste it
6. **I drive:** complete account profile (paste in long descriptions from Section 3)
7. **I drive:** navigate to "Get Recognised", open Recognition Form
8. **I drive:** fill all structured fields (Sections 1, 2, 4, 5)
9. **I drive:** upload documents from Section 6
10. **You do:** Aadhaar e-sign at the very end (1 OTP to your phone)
11. **I drive:** submit form, save the SRN (application reference) for tracking

**Estimated total time at M2:** 30 minutes if descriptions are pre-approved.

After submission: **2-10 working days** → DPIIT recognition certificate. Then we chain trademark + cloud credits + GST + IEC immediately.

---

## After DPIIT — automatic chain (Session 3, separate)

| # | Action | Cost | Need from Gabriel |
|---|---|---|---|
| 1 | Apply AWS Activate (AI tier $300K credits) | ₹0 | DPIIT cert PDF |
| 2 | Apply GCP for Startups ($350K) | ₹0 | DPIIT cert PDF |
| 3 | Apply Microsoft Founders Hub ($5K bootstrap tier) | ₹0 | DPIIT cert PDF |
| 4 | File Trademark Class 9 (software) — 50% startup rebate | ₹4,500 | DSC |
| 5 | File Trademark Class 44 (medical services) — 50% startup rebate | ₹4,500 | DSC |
| 6 | Apply 80-IAC tax holiday | ₹0 | Defer until paying customers |

---

## Open questions / dependencies

- **Board Resolution authorising Gabriel as Startup India signatory** — draft exists; needs both directors' wet signatures or DSC, then scanned/exported PDF. Can do via Murugan once he's onboarded.
- **NIC code primary choice** — I picked **6201 (Computer programming)**. Alternative: **6209 (Other IT services)**. 6201 is what almost every Indian SaaS company uses for DPIIT. Confirm.
- **Sector tag** — DPIIT taxonomy lets us pick multiple. I propose: **Healthcare & Life Sciences (primary), AI (cross-cutting), Enterprise Software (cross-cutting)**. Confirm.
- **Authorised signatory** — defaulting to Gabriel. Dad as backup signatory if needed.
- **Trademark logo file** — locked to dark version unless you say otherwise.
- **The descriptions in Section 3** — read them and edit. The DPIIT inter-ministerial board reads these carefully when deciding on 80-IAC later, so getting them tight matters even though the recognition form itself is rarely rejected on copy.
