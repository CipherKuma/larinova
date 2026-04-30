type PatientRelation =
  | {
      full_name: string | null;
      patient_code: string | null;
    }
  | {
      full_name: string | null;
      patient_code: string | null;
    }[]
  | null;

export interface ConsultationScheduleRow {
  id: string;
  consultation_code: string;
  start_time: string;
  end_time: string | null;
  status: string;
  chief_complaint: string | null;
  larinova_patients: PatientRelation;
}

export interface AppointmentScheduleRow {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string | null;
  status: string;
  booker_name: string;
  chief_complaint: string | null;
  larinova_patients?: PatientRelation;
}

export interface ScheduleEntry {
  id: string;
  source: "consultation" | "appointment";
  consultation_code: string;
  start_time: string;
  end_time: string | null;
  status: string;
  chief_complaint: string | null;
  larinova_patients: {
    full_name: string | null;
    patient_code: string | null;
  } | null;
}

export function normalizePatientRelation(relation: PatientRelation) {
  if (Array.isArray(relation)) return relation[0] ?? null;
  return relation ?? null;
}

export function consultationToScheduleEntry(
  consultation: ConsultationScheduleRow,
): ScheduleEntry {
  return {
    ...consultation,
    source: "consultation",
    larinova_patients: normalizePatientRelation(
      consultation.larinova_patients,
    ),
  };
}

export function appointmentToScheduleEntry(
  appointment: AppointmentScheduleRow,
): ScheduleEntry {
  const patient = normalizePatientRelation(appointment.larinova_patients ?? null);

  return {
    id: appointment.id,
    source: "appointment",
    consultation_code: "Scheduled appointment",
    start_time: `${appointment.appointment_date}T${appointment.start_time}`,
    end_time: appointment.end_time
      ? `${appointment.appointment_date}T${appointment.end_time}`
      : null,
    status: appointment.status === "confirmed" ? "scheduled" : appointment.status,
    chief_complaint: appointment.chief_complaint,
    larinova_patients: patient ?? {
      full_name: appointment.booker_name,
      patient_code: null,
    },
  };
}

export function sortScheduleEntries(entries: ScheduleEntry[]): ScheduleEntry[] {
  return [...entries].sort((a, b) => {
    const byStart = a.start_time.localeCompare(b.start_time);
    if (byStart !== 0) return byStart;
    return a.source.localeCompare(b.source);
  });
}
