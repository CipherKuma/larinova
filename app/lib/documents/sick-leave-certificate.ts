interface CertificatePatient {
  fullName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
}

interface CertificateDoctor {
  fullName?: string | null;
  specialization?: string | null;
  licenseNumber?: string | null;
  clinicAddress?: string | null;
}

export interface SickLeaveCertificateForm {
  condition: string;
  treatmentProvided: string;
  leaveStartDate: string;
  leaveEndDate: string;
  restAdvice?: string | null;
  remarks?: string | null;
}

export interface SickLeaveCertificateInput {
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

function formatGender(value?: string | null): string {
  if (!value) return "Not recorded";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function calculateAge(dateOfBirth: string | null | undefined, issueDate: string) {
  if (!dateOfBirth) return "Not recorded";
  const dob = parseDate(dateOfBirth);
  const issue = parseDate(issueDate);
  if (!dob || !issue) return "Not recorded";
  let age = issue.getFullYear() - dob.getFullYear();
  const monthDelta = issue.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && issue.getDate() < dob.getDate())) {
    age -= 1;
  }
  return String(Math.max(age, 0));
}

function calculateLeaveDays(startDate: string, endDate: string) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end || end < start) return null;
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.round((end.getTime() - start.getTime()) / dayMs) + 1;
}

export function buildSickLeaveCertificateContent({
  issueDate,
  patient,
  doctor,
  form,
}: SickLeaveCertificateInput): string {
  const age = calculateAge(patient.dateOfBirth, issueDate);
  const gender = formatGender(patient.gender);
  const leaveDays = calculateLeaveDays(
    form.leaveStartDate,
    form.leaveEndDate,
  );
  const leaveDuration = leaveDays
    ? `${leaveDays} ${leaveDays === 1 ? "day" : "days"}`
    : "the advised duration";

  return `Patient Details:
Name: ${patient.fullName}
Age/Sex: ${age}/${gender}
Address: ${patient.address || "Not recorded"}
Date of Issue: ${formatDate(issueDate)}

Certifying Doctor Details:
Dr. ${doctor.fullName || "Doctor"}
${doctor.specialization || "Medical Practitioner"}
License No.: ${doctor.licenseNumber || "Not recorded"}
Clinic Address: ${doctor.clinicAddress || "Not recorded"}

Certificate:

This is to certify that Mr./Ms. ${patient.fullName}, aged ${age}, has been under my care for ${form.condition}. Treatment provided: ${form.treatmentProvided}.

After examination, I recommend ${leaveDuration} of sick leave from ${formatDate(form.leaveStartDate)} to ${formatDate(form.leaveEndDate)} for proper rest and recovery.

The patient is advised to ${form.restAdvice || "rest, follow prescribed medication, and return for review if symptoms worsen."}

Remarks:
${form.remarks || "No additional restrictions recorded."}

________________________________
Dr. ${doctor.fullName || "Doctor"}

DRAFT DOCUMENT - Requires physician review, verification of dates/diagnosis, and signature before use.`;
}
