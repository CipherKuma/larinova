# Larinova bank onboarding

Status as of 2026-05-01: ICICI is the preferred first attempt; HDFC Startup Current Account remains the fallback.

## Target stack

1. ICICI company current account for LARINOVA PRIVATE LIMITED.
2. Razorpay MoneySaver Export Account for inbound export collections after bank/GST/IEC readiness.
3. Wise Business as a backup inbound rail after IEC and company bank verification.
4. Personal ICICI savings account only if Gabriel wants linked founder banking convenience.

## ICICI company account

Official application URL:

```text
https://cadigital.icici.bank.in/CaOnline/?source=Insta_CA_Website
```

Initial form fields verified live:

| Field | Value to use |
|---|---|
| Customer type | Private Ltd |
| Name as per PAN | LARINOVA PRIVATE LIMITED |
| Email | gabriel@larinova.com |
| Pincode | 600126 |
| Mobile | Pending Gabriel confirmation |
| Branch | Pending branch list after mobile/pincode flow |

ICICI's live document checklist for `company & llp`:

- Entity PAN
- Constitution documents of the firm
- KYC of authorised signatories and beneficial owners: PAN, identity proof, address proof
- Board Resolution/LLP letter and other required documents
- FATCA
- Account-opening cheque

## Files already available

| Requirement | File/location |
|---|---|
| Certificate of Incorporation / CIN / PAN / TAN | `01-incorporation/Application approved__SPICE + Part B_Approval Letter_AC3085730.pdf` |
| MoA | `01-incorporation/Razorpay Rize _ BizFoc Missing documents__INC 33 Post Approval.pdf` |
| AoA | `01-incorporation/Razorpay Rize _ BizFoc Missing documents__INC 34 Post Approval.pdf` |
| Company PAN acknowledgement | `01-incorporation/PAN allotment letter for your PAN application 050109700948974__050109700948974_signed.pdf` and related PAN PDF |
| TAN acknowledgement | `01-incorporation/TAN allotment letter for your TAN application _ 88305930153000 ___88305930153000_signed.pdf` |
| Name approval | `03-name-approval/Razorpay Rize _ BizFoc – Your Company Name is Approved__MCA Name Approval.pdf` |
| Verified identifiers | `01-identifiers.md` |

## Missing before completion

- Authorised mobile number for OTP and bank callback.
- Branch selection after ICICI loads eligible branches for pincode `600126`.
- Board resolution authorising current account opening and authorised signatories.
- Director KYC bundle for Gabriel Antony Xaviour and Antony Xaviour.
- Account-opening cheque if ICICI requires initial funding by cheque.
- Any physical/in-person verification requested by ICICI for Private Ltd accounts.

## Personal ICICI savings account

Official application URL verified live:

```text
https://campaigns.icici.bank.in/casa/3in1Account/main/index.html
```

The form starts with:

- Full name as per PAN
- PAN
- Mobile number
- OTP to mobile
- Terms consent

Do not submit without Gabriel present for mobile OTP/video KYC.
