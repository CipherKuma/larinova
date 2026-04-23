import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPatientFromAuthHeader } from "@/lib/auth/patient";
import { jsonWithCors, preflight } from "@/lib/cors";

/**
 * POST /api/appointments/:id/cancel
 *
 * Called from patient.larinova.com when a patient cancels a booking. Scoped
 * so a patient can only cancel appointments whose booker_email OR linked
 * patient row matches the authenticated JWT email.
 */

const bodySchema = z.object({
  reason: z.string().max(500).optional(),
});

export async function OPTIONS(req: Request) {
  return preflight(req);
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const patient = await getPatientFromAuthHeader(req);
  if (!patient) {
    return jsonWithCors(req, { error: "unauthorized" }, { status: 401 });
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(
      (await req.json().catch(() => ({}))) as Record<string, unknown>,
    );
  } catch (err) {
    return jsonWithCors(
      req,
      { error: "invalid_body", detail: String(err) },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  const { data: appointment } = await supabase
    .from("larinova_appointments")
    .select("id, booker_email, patient_id, status")
    .eq("id", id)
    .maybeSingle();
  if (!appointment) {
    return jsonWithCors(req, { error: "not_found" }, { status: 404 });
  }

  const owns =
    appointment.booker_email?.toLowerCase() === patient.email.toLowerCase() ||
    (await patientOwnsById(appointment.patient_id, patient.email));
  if (!owns) {
    return jsonWithCors(req, { error: "forbidden" }, { status: 403 });
  }

  if (appointment.status === "cancelled") {
    return jsonWithCors(req, { ok: true, alreadyCancelled: true });
  }

  const { error: updateErr } = await supabase
    .from("larinova_appointments")
    .update({
      status: "cancelled",
      notes: parsed.reason
        ? `[patient-cancelled] ${parsed.reason}`
        : "[patient-cancelled]",
    })
    .eq("id", id);

  if (updateErr) {
    return jsonWithCors(
      req,
      { error: "cancel_failed", detail: updateErr.message },
      { status: 500 },
    );
  }

  return jsonWithCors(req, { ok: true, appointmentId: id });
}

async function patientOwnsById(
  patientId: string | null,
  email: string,
): Promise<boolean> {
  if (!patientId) return false;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("larinova_patients")
    .select("id")
    .eq("id", patientId)
    .ilike("email", email)
    .maybeSingle();
  return !!data;
}
