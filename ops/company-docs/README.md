# LARINOVA PRIVATE LIMITED — Company documents

All documents downloaded from `gabrielantony56@gmail.com` + `gabriel@larinova.com` Gmail inboxes, swept 2026-04-24. Source of truth for what's been received/filed so far.

## Quick reference

| | |
|---|---|
| Full legal name | **LARINOVA PRIVATE LIMITED** |
| CIN | **U62012TN2026PTC192444** |
| Company PAN | **AAGCL8535J** |
| Company TAN | **CHEL10203E** |
| Date of incorporation | **22 April 2026** |
| Jurisdiction | Tamil Nadu, ROC Central Registration Centre (Manesar) |
| Registered office | 4/2377, 60 feet road, Vijay Avenue 4th street, Sithalapakkam, Tambaram, Kanchipuram — 600126, Tamil Nadu |
| Director 1 | **Gabriel Antony Xaviour** — DIN `11680005` |
| Director 2 | **Antony Xaviour** (DIN on DIN-approval letter) |
| Type | Private company limited by shares |

All values verified against the actual signed PDFs in `01-incorporation/`.

## What's in this folder

### `01-incorporation/` — core legal docs
- `Application approved__SPICE + Part B_Approval Letter_AC3085730.pdf` — **Certificate of Incorporation** (the load-bearing doc — has CIN, PAN, TAN, date, registered office)
- `Application approved__SPICE + Part B_DIN Approval Letter_AC3085730.pdf` — DIN approval letter (Gabriel DIN 11680005)
- `Razorpay Rize _ BizFoc Missing documents__MCA Final Approval Letter.pdf` — MCA's final incorporation approval (same content as SPICE approval, sent via BizFoc)
- `Razorpay Rize _ BizFoc Missing documents__INC 33 Post Approval.pdf` — **MoA** (Memorandum of Association)
- `Razorpay Rize _ BizFoc Missing documents__INC 34 Post Approval.pdf` — **AoA** (Articles of Association)
- `PAN allotment letter for your PAN application 050109700948974__050109700948974_signed.pdf` — PAN acknowledgement (company)
- `PAN allotment letter for your PAN application _ 882052107214670 ___882052107214670_signed.pdf` — second PAN acknowledgement
- `TAN allotment letter for your TAN application _ 88305930153000 ___88305930153000_signed.pdf` — TAN acknowledgement
- `e-Policy Document for policy Number 328971012__*.pdf` (×5) — **insurance policy documents** (policy #328971012). Needs review — probably directors' indemnity or property insurance. NOT part of MCA filings.
- `Fwd_ to print__Formulaire_CS_EN.pdf` — unrelated French form caught by the sweep (ignore / delete)

### `03-name-approval/`
- `Razorpay Rize _ BizFoc – Your Company Name is Approved__MCA Name Approval.pdf` — MCA name availability letter (issued 24 March 2026)

### `04-mca-approvals/`
Duplicates of the two key MCA emails, kept for provenance from `from:mca.gov.in`:
- CoI (SPICE + Part B Approval Letter)
- DIN Approval Letter

### `05-vendor-correspondence/bizfoc/`
Attachments from BizFoc / BizFoc-CC'd threads. Same PDFs as above — BizFoc was the Razorpay Rize incorporation partner so they forwarded all MCA outputs.

### `05-vendor-correspondence/razorpay-rize/`
Attachments from Razorpay Rize threads (mostly duplicates of BizFoc — same partner chain).

### `_manifest.json`
Full sweep record: thread subjects, senders, dates, attachment names, save paths. 40 threads scanned total.

## What's *not* in this folder (because the email doesn't exist yet)

Checked all inbox threads through 2026-04-24 — no evidence of:
- Bank account opening correspondence
- Capital infusion / share certificate issuance
- ADT-1 filing (statutory auditor appointment)
- INC-20A filing (commencement of business)
- GST registration application or GSTIN
- Startup India recognition
- Trademark applications
- IEC (Import Export Code)
- Signed ADT-1 consent letter from Dad's CA

See `00-TODO.md` for the action list.

## Sweep details

- **Swept:** 2026-04-24 07:45 UTC
- **Accounts:** `gabrielantony56@gmail.com` (37 threads, 10 files) + `gabriel@larinova.com` (3 threads, 2 files)
- **Queries:** `from:mca.gov.in`, `from:bizfoc.in OR bizfoc.com`, `"Razorpay Rize" OR rizeincorporation`
- **Scope:** narrowly Larinova company formation only — workspace billing, domain renewals, and non-company threads excluded

## How to refresh

Attached Chrome + persistent profile at `~/.playwright-sessions/.chrome-profile/` retains the login. To re-run:

```bash
cd /Users/gabrielantonyxaviour/Documents/infra/playwright-cli-sessions
node dist/cli.js browser status            # verify attached Chrome is alive
node dist/cli.js exec /tmp/larinova-gmail-sweep.mjs
```
