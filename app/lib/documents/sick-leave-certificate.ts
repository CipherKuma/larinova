interface CertificatePatient {
  fullName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
}

interface CertificateDoctor {
  fullName?: string | null;
  specialization?: string | null;
  degrees?: string | null;
  licenseNumber?: string | null;
  registrationNumber?: string | null;
  registrationCouncil?: string | null;
  clinicName?: string | null;
  clinicAddress?: string | null;
  phoneNumber?: string | null;
}

export const MEDICAL_CERTIFICATE_TYPES = [
  "sick_leave",
  "work_from_home",
  "fitness",
  "diagnosis",
  "caretaker",
  "recovery",
] as const;

export type MedicalCertificateType = (typeof MEDICAL_CERTIFICATE_TYPES)[number];

export const MEDICAL_CERTIFICATE_TYPE_TITLES: Record<
  MedicalCertificateType,
  string
> = {
  sick_leave: "Sick Leave Certificate",
  work_from_home: "Work From Home Certificate",
  fitness: "Medical Fitness Certificate",
  diagnosis: "Medical Diagnosis Certificate",
  caretaker: "Caretaker Certificate",
  recovery: "Recovery Certificate",
};

export interface SickLeaveCertificateForm {
  condition: string;
  treatmentProvided: string;
  examinationDate: string;
  leaveStartDate: string;
  leaveEndDate: string;
  placeOfIssue: string;
  patientSignatureOrThumb: string;
  identificationMarkOne: string;
  identificationMarkTwo?: string | null;
  restAdvice?: string | null;
  remarks?: string | null;
}

export interface SickLeaveCertificateInput {
  certificateType?: MedicalCertificateType;
  certificateId?: string;
  issueDate: string;
  patient: CertificatePatient;
  doctor: CertificateDoctor;
  form: SickLeaveCertificateForm;
}

function parseDate(value: string): Date | null {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: string): string {
  const date = parseDate(value);
  if (!date) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateLeaveDays(startDate: string, endDate: string) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end || end < start) return null;
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.round((end.getTime() - start.getTime()) / dayMs) + 1;
}

function buildCertificateBody(
  certificateType: MedicalCertificateType,
  patient: CertificatePatient,
  form: SickLeaveCertificateForm,
): string {
  const start = formatDate(form.leaveStartDate);
  const end = formatDate(form.leaveEndDate);
  const examinedOn = formatDate(form.examinationDate);
  const days = calculateLeaveDays(form.leaveStartDate, form.leaveEndDate);
  const duration = days
    ? `${days} ${days === 1 ? "day" : "days"}`
    : "the advised duration";
  const notes =
    form.restAdvice || "Follow the medical advice discussed during consultation.";
  const remarks = form.remarks || "No additional restrictions recorded.";

  switch (certificateType) {
    case "work_from_home":
      return `I, the undersigned registered medical practitioner, certify that after careful examination on ${examinedOn}, Mr./Ms. ${patient.fullName}, whose signature/thumb impression and identification marks are recorded above, has been under my care for ${form.condition}. Treatment provided: ${form.treatmentProvided}.

Based on clinical assessment, the patient is advised to work from home for ${duration}, from ${start} to ${end}, to support recovery while avoiding unnecessary exertion or exposure.

Advice:
${notes}

Remarks:
${remarks}`;
    case "fitness":
      return `I, the undersigned registered medical practitioner, certify that after careful examination on ${examinedOn}, Mr./Ms. ${patient.fullName}, whose signature/thumb impression and identification marks are recorded above, was examined for ${form.condition}. Assessment/treatment recorded: ${form.treatmentProvided}.

Based on the clinical assessment, the patient is medically fit for routine daily activities from ${start} to ${end}, subject to the advice and restrictions below.

Advice / Restrictions:
${notes}

Remarks:
${remarks}`;
    case "diagnosis":
      return `I, the undersigned registered medical practitioner, certify that after careful examination on ${examinedOn}, Mr./Ms. ${patient.fullName}, whose signature/thumb impression and identification marks are recorded above, has been evaluated and diagnosed with ${form.condition}. Assessment/treatment recorded: ${form.treatmentProvided}.

This certificate is issued to document the diagnosis and care period from ${start} to ${end}.

Advice:
${notes}

Remarks:
${remarks}`;
    case "caretaker":
      return `I, the undersigned registered medical practitioner, certify that after careful examination on ${examinedOn}, Mr./Ms. ${patient.fullName}, whose signature/thumb impression and identification marks are recorded above, has been under my care for ${form.condition}. Treatment provided: ${form.treatmentProvided}.

The patient requires caretaker support for ${duration}, from ${start} to ${end}, based on the present clinical condition and recovery needs.

Care Instructions:
${notes}

Remarks:
${remarks}`;
    case "recovery":
      return `I, the undersigned registered medical practitioner, certify that after careful examination on ${examinedOn}, Mr./Ms. ${patient.fullName}, whose signature/thumb impression and identification marks are recorded above, has been under my care for ${form.condition}. Treatment provided: ${form.treatmentProvided}.

Based on the clinical review, the patient has recovered sufficiently by ${end} and may return to work/classes or routine activity from that date, subject to the advice below.

Advice:
${notes}

Remarks:
${remarks}`;
    case "sick_leave":
    default:
      return `I, the undersigned registered medical practitioner, certify that after careful examination on ${examinedOn}, Mr./Ms. ${patient.fullName}, whose signature/thumb impression and identification marks are recorded above, is suffering from ${form.condition}. Treatment provided: ${form.treatmentProvided}.

After examination, I recommend ${duration} of sick leave from ${start} to ${end} for proper rest and recovery.

The patient is advised to ${form.restAdvice || "rest, follow prescribed medication, and return for review if symptoms worsen."}

Remarks:
${remarks}`;
  }
}

/**
 * Builds the certificate CONTENT BODY ONLY.
 *
 * The doctor letterhead (name + registration), the patient demographic row
 * (name / age / sex), and the signature line are NOT emitted here — they are
 * rendered exactly once by `DocumentPrintPreview`, which is the single source
 * of letterhead, patient header, and doctor signature. Emitting them here too
 * is what previously made every certificate print its header and signature
 * twice.
 *
 * Sections are emitted as `## ` headings so `parseSections` renders each as a
 * titled block. We keep only the data the preview chrome does NOT already
 * show: the certificate register/issue metadata, the patient verification
 * (signature/thumb + identification marks), the certifying statement, and the
 * brief case resume — all medico-legally required by MCI-2002 Appendix 2.
 */
export function buildMedicalCertificateContent({
  certificateType = "sick_leave",
  certificateId,
  issueDate,
  patient,
  form,
}: SickLeaveCertificateInput): string {
  const body = buildCertificateBody(certificateType, patient, form);
  const title = MEDICAL_CERTIFICATE_TYPE_TITLES[certificateType];

  return `## ${title}

Certificate Register No.: ${certificateId || "Pending document number"}
Date of Issue: ${formatDate(issueDate)}
Place: ${form.placeOfIssue}

## Patient Verification

Patient signature/thumb impression: ${form.patientSignatureOrThumb}
Identification mark 1: ${form.identificationMarkOne}
Identification mark 2: ${form.identificationMarkTwo || "Not recorded"}

## Certificate Statement

${body}

## Brief Case Resume

Nature of illness/condition: ${form.condition}
Assessment/treatment: ${form.treatmentProvided}
Probable duration / validity: ${formatDate(form.leaveStartDate)} to ${formatDate(form.leaveEndDate)}
Advice/restrictions: ${form.restAdvice || "As advised during consultation."}`;
}

export function buildSickLeaveCertificateContent(
  input: SickLeaveCertificateInput,
): string {
  return buildMedicalCertificateContent({
    ...input,
    certificateType: "sick_leave",
  });
}
