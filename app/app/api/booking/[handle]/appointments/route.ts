import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDoctorNewBookingNotification } from "@/lib/resend/email";
import { notify } from "@/lib/notify";
import { generateTimeSlots, filterAvailableSlots } from "@/lib/booking/slots";

const GENDER_VALUES = ["male", "female", "other", "prefer_not_to_say"] as const;
const TYPE_VALUES = ["video", "in_person"] as const;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    appointment_date,
    start_time,
    type,
    booker_name,
    booker_email,
    booker_phone,
    booker_age,
    booker_gender,
    reason,
    chief_complaint,
    notes,
  } = body as Record<string, string>;

  if (
    !appointment_date ||
    !start_time ||
    !type ||
    !booker_name ||
    !booker_email ||
    !booker_phone ||
    !booker_age ||
    !booker_gender ||
    !reason ||
    !chief_complaint
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }
  if (!TYPE_VALUES.includes(type as (typeof TYPE_VALUES)[number])) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (
    !GENDER_VALUES.includes(booker_gender as (typeof GENDER_VALUES)[number])
  ) {
    return NextResponse.json({ error: "Invalid gender" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(appointment_date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: doctor } = await supabase
    .from("larinova_doctors")
    .select(
      "id, full_name, email, clinic_name, clinic_address, slot_duration_minutes, video_call_link, booking_enabled",
    )
    .eq("booking_handle", handle)
    .single();

  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }
  if (!doctor.booking_enabled) {
    return NextResponse.json(
      { error: "Doctor not accepting bookings" },
      { status: 403 },
    );
  }

  const dayOfWeek = new Date(appointment_date + "T00:00:00").getDay();
  const { data: avail } = await supabase
    .from("larinova_doctor_availability")
    .select("start_time, end_time, is_active, break_start, break_end")
    .eq("doctor_id", doctor.id)
    .eq("day_of_week", dayOfWeek)
    .single();

  if (!avail || !avail.is_active) {
    return NextResponse.json(
      { error: "No availability on this day" },
      { status: 409 },
    );
  }

  const slotDuration = doctor.slot_duration_minutes ?? 30;
  const allSlots = generateTimeSlots(
    avail.start_time.substring(0, 5),
    avail.end_time.substring(0, 5),
    slotDuration,
    avail.break_start,
    avail.break_end,
  );
  if (!allSlots.includes(start_time)) {
    return NextResponse.json({ error: "Invalid time slot" }, { status: 400 });
  }

  const { data: booked } = await supabase
    .from("larinova_appointments")
    .select("start_time")
    .eq("doctor_id", doctor.id)
    .eq("appointment_date", appointment_date)
    .in("status", ["confirmed", "completed"]);

  const available = filterAvailableSlots(
    allSlots,
    (booked ?? []).map((b) => b.start_time),
  );
  if (!available.includes(start_time)) {
    return NextResponse.json(
      { error: "Slot no longer available" },
      { status: 409 },
    );
  }

  const [sh, sm] = start_time.split(":").map(Number);
  const endMins = sh * 60 + sm + slotDuration;
  const end_time = `${Math.floor(endMins / 60)
    .toString()
    .padStart(2, "0")}:${(endMins % 60).toString().padStart(2, "0")}`;

  const { data: appointment, error: insertError } = await supabase
    .from("larinova_appointments")
    .insert({
      doctor_id: doctor.id,
      appointment_date,
      start_time,
      end_time,
      type,
      booker_name,
      booker_email,
      booker_phone,
      booker_age: parseInt(booker_age),
      booker_gender,
      reason,
      chief_complaint,
      notes: notes ?? null,
    })
    .select()
    .single();

  if (insertError || !appointment) {
    console.error("[booking/appointments POST]", insertError);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 },
    );
  }

  const gcalDate = appointment_date.replace(/-/g, "");
  const gcalStart = `${gcalDate}T${start_time.replace(":", "")}00`;
  const gcalEnd = `${gcalDate}T${end_time.replace(":", "")}00`;
  const gcalTitle = encodeURIComponent(
    `Appointment with Dr. ${doctor.full_name}`,
  );
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gcalTitle}&dates=${gcalStart}/${gcalEnd}`;

  const displayDate = new Date(
    appointment_date + "T00:00:00",
  ).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const [h, m] = start_time.split(":").map(Number);
  const displayTime = `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;

  const portalUrl = buildPortalUrl(appointment.id);

  // Resolve the video call link. Doctors who set their own override
  // (Zoom, Google Meet, Teams) get that. Otherwise we auto-generate a
  // private Jitsi Meet room scoped to this appointment — no setup, no
  // OAuth, and a fresh room per booking so old links don't collide.
  const videoCallLink: string | null =
    type === "video"
      ? (doctor.video_call_link ??
        `https://meet.jit.si/larinova-${handle}-${appointment.id.slice(0, 8)}`)
      : null;

  Promise.all([
    notify(
      "email",
      "appointment_confirmation",
      {
        patientName: booker_name,
        doctorName: doctor.full_name,
        clinicName: doctor.clinic_name ?? undefined,
        appointmentDate: displayDate,
        startTime: displayTime,
        appointmentType: type as "video" | "in_person",
        videoCallLink,
        portalUrl,
      },
      {
        email: booker_email,
        name: booker_name,
        doctorId: doctor.id,
        phone: booker_phone,
      },
      {
        relatedEntityType: "appointment",
        relatedEntityId: appointment.id,
      },
    ),
    sendDoctorNewBookingNotification({
      to: doctor.email,
      doctorName: doctor.full_name,
      bookerName: booker_name,
      bookerEmail: booker_email,
      bookerPhone: booker_phone,
      bookerAge: parseInt(booker_age),
      bookerGender: booker_gender,
      reason,
      chiefComplaint: chief_complaint,
      appointmentDate: displayDate,
      startTime: displayTime,
      appointmentType: type as "video" | "in_person",
    }),
  ]).catch((err) => console.error("[booking/appointments email]", err));

  return NextResponse.json({ appointment, googleCalendarUrl }, { status: 201 });
}

function buildPortalUrl(appointmentId: string): string | undefined {
  const base = process.env.NEXT_PUBLIC_PATIENT_PORTAL_URL;
  if (!base) return undefined;
  return `${base.replace(/\/$/, "")}/appointments/${appointmentId}`;
}
