import { createClient } from "@/lib/supabase/server";
import {
  ConsultationsClient,
  type ConsultationListItem,
} from "@/components/consultations/ConsultationsClient";
import {
  appointmentToScheduleEntry,
  consultationToScheduleEntry,
  sortScheduleEntries,
} from "@/lib/appointments/schedule";

export default async function ConsultationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: doctor } = user
    ? await supabase
        .from("larinova_doctors")
        .select("id")
        .eq("user_id", user.id)
        .single()
    : { data: null };

  if (!doctor) {
    return <ConsultationsClient consultations={[]} />;
  }

  const [consultationsResult, appointmentsResult] = await Promise.all([
    supabase
      .from("larinova_consultations")
      .select(
        `
        id,
        consultation_code,
        start_time,
        end_time,
        status,
        chief_complaint,
        larinova_patients (
          full_name,
          patient_code
        )
      `,
      )
      .eq("doctor_id", doctor.id)
      .order("start_time", { ascending: false })
      .limit(50),
    supabase
      .from("larinova_appointments")
      .select("*")
      .eq("doctor_id", doctor.id)
      .eq("status", "confirmed")
      .order("appointment_date", { ascending: false })
      .order("start_time", { ascending: false })
      .limit(50),
  ]);

  if (consultationsResult.error) {
    console.error("Error fetching consultations:", consultationsResult.error);
  }
  if (appointmentsResult.error) {
    console.error("Error fetching appointments:", appointmentsResult.error);
  }

  const consultations = sortScheduleEntries([
    ...(consultationsResult.data || []).map(consultationToScheduleEntry),
    ...(appointmentsResult.data || []).map(appointmentToScheduleEntry),
  ]).reverse() as ConsultationListItem[];

  return <ConsultationsClient consultations={consultations} />;
}
