# Larinova Operations Tracker

**Company:** LARINOVA PRIVATE LIMITED
**CIN:** U62012TN2026PTC192444
**Incorporated:** 22 April 2026
**Last updated:** 1 May 2026
**Purpose:** One source of truth for non-product company operations, compliance, funding, registrations, legal setup, and program applications.

This tracker is meant to be updated by the relevant cmux/Codex surface after every meaningful action. Keep it factual: what happened, who owns the next step, what evidence exists, and what is blocked.

## Status Key

| Status | Meaning |
|---|---|
| `Not started` | No concrete action has begun. |
| `Researching` | Information gathering or eligibility checking is underway. |
| `Ready` | Inputs are prepared; waiting for approval, OTP, signature, or submission window. |
| `In progress` | Active filing, outreach, or execution is underway. |
| `Waiting` | Blocked on a third party, OTP, document, signature, or response. |
| `Done` | Completed and evidence is filed. |
| `Deferred` | Intentionally paused until a named trigger/date. |
| `Rejected` | Reviewed and intentionally ruled out. |

## cmux Surface Map

| Surface | Workstream | Responsibility |
|---|---|---|
| `surface:41` | Ops Control | Master routing, priority, and tracker hygiene. |
| `surface:42` | Bank Account | Current account, bank docs, board resolution, net banking. |
| `surface:43` | ADT-1 ROC | Auditor appointment, ROC/CS coordination, MCA filing calendar. |
| `surface:44` | DPIIT Recognition | Startup India recognition, signatory resolution, application packet. |
| `surface:45` | GST IEC Udyam | GST, IEC, Udyam, Professional Tax, Shops Act. |
| `surface:46` | Trademark Legal | Trademark, legal pages, customer contract templates. |
| `surface:47` | Capital INC20A | Paid-up capital, share certificates, INC-20A. |
| `surface:48` | Cloud Credits | AWS, GCP, Microsoft and related startup credits. |
| `surface:49` | DPDP Insurance | Privacy, DPDP, data retention, subprocessors, insurance. |
| `surface:50` | Funding Control | Master routing for all funding categories. |
| `surface:51` | India Grants | Indian government grants and non-dilutive programs. |
| `surface:52` | Loans Debt | Bank loans, MSME credit, SIDBI, RBF, working capital. |
| `surface:53` | India Accelerators | Indian incubators, accelerators, and seed programs. |
| `surface:54` | Global Accelerators | YC, Techstars, Antler Global, health/global accelerators. |
| `surface:55` | Health AI Funding | Healthtech, AI, digital health, ABDM, hospital innovation programs. |
| `surface:56` | VC Angels | Angels, seed funds, healthtech/AI SaaS investors. |
| `surface:57` | Funding Assets | Deck, one-liner, data room, traction table, reusable assets. |
| `surface:58` | Web3 AI Strategy | Web3 grants, ecosystem funding, and long-term Web3 AI product path. |

## Priority Board

| Priority | Workstream | Status | Owner / Surface | Deadline / Trigger | Next Action | Evidence / Notes |
|---|---|---|---|---|---|---|
| P0 | Current account | Waiting | `surface:42` | ASAP | Resolve final bank choice and collect current-account document list. | HDFC SmartUp thread listed in `STARTUP_OPPS_2026.md`; earlier notes also mentioned ICICI/Kotak preference, so confirm final choice. |
| P0 | ADT-1 auditor appointment | Waiting | `surface:43` | 22 May 2026 | Wait for CS Murugan response before the next filing step; then send documents and coordinate auditor appointment filing. | Contact received from Praveen Office Accountant. Email sent to `murugantmp@yahoo.co.in`; WhatsApp sent to `+91 90809 40689`; copied Antony and CA Innocent on email. Waiting on DSC token and CS response. |
| P0 | Paid-up capital infusion | Not started | `surface:47` | Within 60 days of incorporation | Confirm paid-up capital, transfer founder capital after bank opens, preserve bank proof. | Depends on current account. |
| P0 | INC-20A commencement | Not started | `surface:47` | 19 October 2026 | Prepare declaration and bank proof after capital infusion. | Depends on bank account and capital receipt. |
| P1 | GST registration | Researching | `surface:45` | Before first invoice/payment gateway | Prepare voluntary GST application inputs now; do not submit without Gabriel approval. | Bank details can be furnished after GSTIN through non-core amendment, but must be provided within the required post-registration window / before returns. |
| P1 | DPIIT recognition | Ready | `surface:44` | ASAP | Submit Startup India recognition form once Gabriel approves packet and OTP/signature steps. | Packet drafted in `DPIIT_APPLICATION.md`; upload docs staged under `ops/company-docs/_incoming/2026-04-30-incorporation-shortnames/`; board resolution needs signed PDF. |
| P1 | IEC | Waiting | `surface:45` | Before foreign receipts | Prepare DGFT profile/application data now; submit only after company bank account is open and Gabriel approves. | DGFT IEC requires PAN plus company bank account and valid address. Needed for Indonesia/foreign revenue. |
| P1 | Udyam/MSME | Researching | `surface:45` | ASAP | Prepare Udyam inputs now; decide whether to file before or after GSTIN based on portal requirements at submission time. | Free MSME registration; PAN/GST-linked data may be pulled automatically where applicable. Do not submit without Gabriel approval. |
| P1 | Website legal pages | Not started | `surface:46` | Before payment gateway / broad customer onboarding | Draft Terms, Privacy, Refund, Contact, subprocessor list. | Must use actual registered office and vendor list. |
| P1 | Trademark LARINOVA | Not started | `surface:46` | ASAP or after DPIIT | Search and file Class 9 + Class 44. | DPIIT may reduce filing cost. |
| P2 | Cloud credits | Not started | `surface:48` | After DPIIT certificate | Apply to AWS, GCP, Microsoft startup programs. | Depends on DPIIT recognition and reusable assets. |
| P2 | DPDP readiness | Not started | `surface:49` | Before broader production use; latest internal target 13 May 2027 | Draft consent, retention, deletion/access process, breach process, subprocessor list. | Health data handling makes this important even before enterprise sales. |
| P2 | Insurance review | Not started | `surface:49` | Before hospital procurement | Review policy #328971012 and consider professional indemnity/cyber liability. | Existing policy PDFs are in company docs. |
| P2 | Funding assets | Researching | `surface:57` | Before any serious grant/accelerator/investor application | Assemble one-liner, deck, founder bios, traction table, compliance packet, screenshots. | Reusable across all funding channels. |
| P3 | India grants | Deferred | `surface:51` | Re-evaluate Q4 2026 or after 5 paying doctors | Track BIRAC, MeitY, SISFS, TANSEED, StartupTN windows. | Existing decision: do not apply prematurely. |
| P3 | Loans/debt | Researching | `surface:52` | After bank/GST or revenue | Rank pre-revenue vs early-revenue debt options. | Avoid unnecessary debt before clear use of funds. |
| P3 | India accelerators | Deferred | `surface:53` | Re-evaluate Q4 2026 or after stronger traction | Track best-fit health/SaaS/AI accelerators. | Need stronger narrative and traction. |
| P3 | Global accelerators | Deferred | `surface:54` | YC W27 prep around August 2026; other windows as found | Track YC, Techstars, Antler Global, Plug and Play Health and global programs. | Verify all deadlines from official pages before action. |
| P3 | Health AI funding | Researching | `surface:55` | Continuous monitoring | Track digital health, AI, ABDM, and hospital innovation programs. | Good strategic fit; avoid low-fit generic programs. |
| P3 | VC / angels | Deferred | `surface:56` | After 5 paying doctors or hospital pilots | Build investor target list and warm-intro plan. | Do not start cold fundraising without traction. |
| P3 | Web3 AI strategy | Researching | `surface:58` | Long-term optional path | Map now/bridge/long-term Web3 opportunities without distorting current SaaS. | Treat as strategic optionality, not near-term tokenization. |

## Detailed Checklists

### Bank Account

- [ ] Resolve final bank choice.
- [ ] Confirm document list from bank.
- [ ] Prepare board resolution for current account.
- [ ] Gather CoI, MoA, AoA, PAN, TAN, director KYC, office proof.
- [ ] Open current account.
- [ ] Enable net banking and admin access.
- [ ] Record account number, IFSC, branch, relationship manager.
- [ ] Update payment gateway and tax workstreams once bank proof exists.

### ADT-1 / ROC / CA-CS

- [x] Confirm CS Murugan contact.
- [ ] Confirm CS Murugan fee structure and filing process.
- [ ] Confirm statutory auditor.
- [ ] Obtain auditor consent letter.
- [ ] Obtain auditor non-disqualification certificate.
- [ ] Prepare board meeting minutes/resolution.
- [ ] File ADT-1 by 22 May 2026.
- [ ] Store SRN, challan, acknowledgement, and filed form.
- [ ] Maintain annual compliance calendar.

### Capital / INC-20A

- [ ] Confirm authorized and paid-up capital from MoA.
- [ ] Transfer capital from founders to company account.
- [ ] Preserve bank statement showing receipt.
- [ ] Issue share certificates.
- [ ] Update register of members.
- [ ] Prepare INC-20A declaration.
- [ ] File INC-20A by 19 October 2026.
- [ ] Store SRN, challan, acknowledgement, and filed form.

### GST / IEC / Udyam / Local Registrations

- [x] Decide voluntary GST posture: prepare now; submit only after Gabriel approval.
- [ ] GST pre-bank readiness: gather CoI, company PAN `AAGCL8535J`, registered office address/proof, authorised signatory details, director KYC, email/mobile, business description, HSN/SAC, Aadhaar/DSC/OTP path, and upload-ready files.
- [ ] GST post-bank action: add company bank details through non-core amendment after GSTIN if not available at initial registration; complete within the required post-registration window / before GSTR-1/IFF due date, whichever is earlier.
- [ ] Complete Aadhaar/OTP authentication if required.
- [ ] Store GSTIN and registration certificate.
- [ ] IEC pre-bank readiness: prepare DGFT account/profile data, company PAN, CIN, registered office address, contact email/mobile, director/signatory KYC, export-service description, and document list.
- [ ] IEC post-bank action: apply only after company bank account details/proof exist.
- [ ] Store IEC certificate and share IEC number with bank/payment rails before foreign receipts.
- [ ] Udyam pre-bank readiness: prepare company identifiers, NIC/activity selection, investment/turnover self-declaration assumptions, registered office details, authorised signatory details, and Aadhaar/OTP path.
- [ ] Udyam submission gate: verify live portal requirement for GSTIN at submission time; submit only after Gabriel approval.
- [ ] Professional Tax pre-bank readiness: confirm Chennai/Tamil Nadu establishment facts, expected payroll date, director remuneration/salary plan, and first half-year deadline of 30 September 2026.
- [ ] Professional Tax trigger action: enrol/pay when business/company-tax or employee PT trigger is confirmed by CA/local portal.
- [ ] Shops Act pre-bank readiness: confirm whether the registered office counts as an establishment and whether the employee/worker threshold or non-residential office trigger applies.
- [ ] Shops Act trigger action: register only when the trigger is met or CA/local portal confirms it is needed.
- [ ] Approval gate: no GST, IEC, Udyam, Professional Tax, or Shops Act submission without explicit Gabriel approval.

#### GST / IEC / Udyam readiness split

| Registration | Can do before company bank account | Blocked until company bank account | Do-not-submit gate |
|---|---|---|---|
| GST voluntary registration | Prepare application data, documents, signatory/KYC, business description, SAC/HSN, OTP/DSC path, and office proof. | Furnish company bank details after GSTIN if not available initially; complete within the required post-registration window / before returns. | Submit only after Gabriel approves the final application. |
| IEC | Prepare DGFT login/profile, PAN/CIN/address/signatory details, export-services description, and upload checklist. | DGFT IEC application submission, because IEC requires PAN plus company bank account and valid address. | Submit only after bank account exists and Gabriel approves. |
| Udyam/MSME | Prepare enterprise details, Aadhaar/OTP path, NIC/activity codes, investment/turnover assumptions, PAN/CIN/address. | Final filing may wait if live portal requires GSTIN for this company at submission time. | Submit only after Gabriel approves and GSTIN dependency is rechecked. |
| Professional Tax / Company Tax | Map Chennai/TN trigger, payroll/director-remuneration plan, business-start facts, and 30 September 2026 half-year deadline. | Payment/enrolment details may depend on final establishment/business facts and CA confirmation. | Enrol/pay only after Gabriel approves the trigger decision. |
| Shops & Establishments Act | Map registered-office use, employee/worker count, non-residential office plan, and Labour portal evidence. | Registration waits until threshold/establishment trigger is confirmed. | Register only after Gabriel approves the trigger decision. |

### DPIIT Recognition

- [ ] Review `DPIIT_APPLICATION.md`.
- [ ] Confirm registered email and phone.
- [ ] Confirm logo and founder photo assets.
- [ ] Print/sign board resolution authorizing Gabriel.
- [ ] Submit Startup India recognition form.
- [ ] Store application reference.
- [ ] Store DPIIT certificate once approved.
- [ ] Notify Cloud Credits, Trademark Legal, and Funding Assets surfaces.

### Trademark / Legal Pages / Contracts

- [ ] Run trademark search for LARINOVA.
- [ ] Decide whether to wait for DPIIT rebate or file immediately.
- [ ] File Class 9.
- [ ] File Class 44.
- [ ] Draft Terms of Service.
- [ ] Draft Privacy Policy.
- [ ] Draft Refund/Cancellation Policy.
- [ ] Draft Contact page with registered office.
- [ ] Draft subprocessor list.
- [ ] Draft MSA, DPA, NDA, pilot agreement, invoice template.

### DPDP / Insurance

- [ ] Write consent model for recording and transcription.
- [ ] Define data retention policy.
- [ ] Define data deletion/access request process.
- [ ] Maintain subprocessor list.
- [ ] Review data hosting regions.
- [ ] Draft breach response process.
- [ ] Review existing insurance policy #328971012.
- [ ] Price professional indemnity.
- [ ] Price cyber liability.

### Funding Control

- [ ] Keep funding categories separate.
- [ ] Maintain apply-now / prepare-later / reject list.
- [ ] Require current official-source verification before deadlines or eligibility claims.
- [ ] Prevent premature grant/accelerator applications before traction gates.
- [ ] Route reusable material requests to Funding Assets.

### India Grants

- [ ] Track BIRAC BIG.
- [ ] Track MeitY SAMRIDH.
- [ ] Track SISFS incubator route.
- [ ] Track TANSEED and StartupTN.
- [ ] Track DST/DBT/health AI calls.
- [ ] Record deadline, eligibility, funding amount, equity/non-equity, and readiness gate.

### Loans / Debt

- [ ] Map pre-revenue debt options.
- [ ] Map post-GST/bank-account options.
- [ ] Map early-revenue/RBF options.
- [ ] Map MSME/CGTMSE/SIDBI routes.
- [ ] Record collateral, guarantee, interest, repayment, and documentation needs.
- [ ] Reject debt that creates burden without a clear use of funds.

### India Accelerators

- [ ] Track C-CAMP.
- [ ] Track T-Hub.
- [ ] Track NSRCEL.
- [ ] Track IITM/healthtech incubators.
- [ ] Track Axilor, Antler India, Surge, W Health India.
- [ ] Record stage fit, equity, funding, mentorship value, deadline, and application assets needed.

### Global Accelerators

- [ ] Track YC.
- [ ] Track Techstars.
- [ ] Track Antler Global.
- [ ] Track Plug and Play Health.
- [ ] Track SEA/Indonesia healthcare startup programs.
- [ ] Record relocation, equity, funding, deadline, stage fit, and strategic value.

### Health AI Funding

- [ ] Track healthtech-specific grants and challenges.
- [ ] Track digital health sandboxes.
- [ ] Track ABDM ecosystem opportunities.
- [ ] Track hospital innovation programs.
- [ ] Track AI-for-health calls.
- [ ] Record clinical credibility requirements and compliance prerequisites.

### VC / Angels

- [ ] Build investor target list.
- [ ] Split into now / after 5 paying doctors / after hospital pilots.
- [ ] Record thesis fit, check size, geography, warm-intro route, and required proof.
- [ ] Prepare concise outreach drafts only after traction narrative is ready.

### Funding Assets

- [ ] One-liner.
- [ ] 100-word description.
- [ ] Founder bios.
- [ ] Product screenshots.
- [ ] Demo video link.
- [ ] Pitch deck.
- [ ] Traction table.
- [ ] Financial model.
- [ ] Compliance packet.
- [ ] Incorporation packet.
- [ ] Customer/pilot evidence.
- [ ] Data room index.

### Web3 AI Strategy

- [ ] Map Web3 opportunities that fit without changing current core SaaS.
- [ ] Map bridge path: consent, verifiable credentials, patient-owned records, privacy/ZK, decentralized AI.
- [ ] Map long-term Web3-native product possibilities.
- [ ] Track Web3 grants and ecosystem funds.
- [ ] Track crypto/Web3 accelerators.
- [ ] Track protocol partnerships.
- [ ] Reject forced tokenization unless there is a clear user, funding, or ecosystem reason.

## Activity Log

Add one line per meaningful action. Keep newest entries at the top.

| Date | Surface | Workstream | Status Change | Note | Evidence / Link |
|---|---|---|---|---|---|
| 1 May 2026 | `surface:44` | DPIIT Recognition | Ready | Readiness audit completed: upload docs and logo/photo assets exist; `DPIIT_APPLICATION.md` paths corrected to the actual staging folder; remaining blockers are Gabriel approval, mobile/Aadhaar OTP, and signed board-resolution PDF. | `DPIIT_APPLICATION.md`; `ops/company-docs/_incoming/2026-04-30-incorporation-shortnames/` |
| 1 May 2026 | `surface:45` | GST IEC Udyam | Not started -> Researching/Waiting split | Split readiness into pre-bank and post-bank tasks. GST preparation can begin now with bank details furnished after GSTIN within the required post-registration window / before returns; IEC remains blocked until company bank account exists; no registration will be submitted without Gabriel approval. | `OPERATIONS_TRACKER.md`; GST portal bank-account guidance; DGFT IEC prerequisite page |
| 1 May 2026 | `surface:43` | ADT-1 ROC | In progress -> Waiting | CS Murugan contact received from Praveen Office Accountant. Email sent to `murugantmp@yahoo.co.in`; WhatsApp sent to `+91 90809 40689`; email copied Antony Xaviour and CA Innocent. Next filing step is blocked until Murugan replies. | `OPERATIONS_TRACKER.md`; Gmail/WhatsApp evidence recorded below |
| 1 May 2026 | `surface:58` | Web3 AI Strategy | Created | Separate Web3 AI strategy surface created for long-term optionality. | cmux surface map |
| 1 May 2026 | `surface:43` | ADT-1 ROC | In progress | Sent introduction email to CS Murugan for ROC/ADT-1 coordination; copied Antony Xaviour and CA Innocent. | Gmail sent ID `19de31b2faff9e28` |
| 1 May 2026 | `surface:43` | ADT-1 ROC | In progress | Sent WhatsApp intro to CS Murugan at `+91 90809 40689`; local WhatsApp DB shows outgoing row at 16:05:30 IST, status `6`, error `0`. | `ChatStorage.sqlite` verification |
| 1 May 2026 | `surface:44` | DPIIT Recognition | Ready | DPIIT workstream instructed to proceed with submission readiness in parallel and identify remaining OTP/signature/upload blockers. | `DPIIT_APPLICATION.md` |
| 1 May 2026 | `surface:45` | GST IEC Udyam | Researching | GST/IEC/Udyam workstream instructed to split actions into pre-bank-account and post-bank-account tasks; IEC is bank-account gated. | DGFT official IEC prerequisite page; GST Rule 10A bank-detail requirement |
| 1 May 2026 | `surface:50`-`surface:57` | Funding | Created | Funding split into control, grants, debt, accelerators, health AI, VC/angels, and assets. | cmux surface map |
| 1 May 2026 | `surface:41`-`surface:50` | Operations | Created | Core operations surfaces created for company setup, compliance, registrations, legal, credits, and funding. | cmux surface map |

## Update Rules

1. Update this file after every material action, not only after completion.
2. Do not mark `Done` without evidence: receipt, SRN, certificate, email, screenshot, signed PDF, or saved acknowledgement.
3. Put unclear items in `Waiting` or `Researching`, not `Done`.
4. For programs, grants, loans, and accelerators, verify current deadlines and eligibility from official/current sources before changing the status.
5. Keep speculative ideas in notes until they become tasks with an owner and trigger.
6. If a task is intentionally not worth doing, mark it `Rejected` with the reason.
