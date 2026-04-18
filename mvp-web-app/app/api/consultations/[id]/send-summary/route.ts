import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import {
  sendConsultationSummary,
  sendPrescriptionEmail,
} from "@/lib/resend/email";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id: consultationId } = await params;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch consultation with relations
    const { data: consultation, error: consultationError } = await supabase
      .from("larinova_consultations")
      .select(
        `
        id, consultation_code, start_time, summary, diagnosis, doctor_notes,
        larinova_doctors!doctor_id ( id, full_name, user_id ),
        larinova_patients!patient_id ( id, full_name, email, phone )
      `,
      )
      .eq("id", consultationId)
      .single();

    if (consultationError || !consultation) {
      return NextResponse.json(
        { error: "Consultation not found" },
        { status: 404 },
      );
    }

    const doctor = consultation.larinova_doctors as any;
    if (!doctor || doctor.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const patient = consultation.larinova_patients as any;
    if (!patient) {
      return NextResponse.json(
        { error: "No patient linked to this consultation" },
        { status: 400 },
      );
    }

    const isPlaceholderEmail =
      !patient.email ||
      patient.email.includes("@unknown.larinova") ||
      patient.email.includes("@placeholder.larinova");

    if (isPlaceholderEmail) {
      return NextResponse.json(
        { error: "Patient email not available" },
        { status: 400 },
      );
    }

    const consultationDate = new Date(
      consultation.start_time,
    ).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Send consultation summary email
    const summaryResult = await sendConsultationSummary({
      patientEmail: patient.email,
      patientName: patient.full_name,
      doctorName: doctor.full_name,
      consultationDate,
      summary: consultation.summary || "",
      diagnosis: consultation.diagnosis || "",
      prescriptions: [],
      doctorNotes: consultation.doctor_notes || undefined,
    });

    if (!summaryResult.success) {
      return NextResponse.json(
        { error: "Failed to send summary email" },
        { status: 500 },
      );
    }

    // Also send prescription email if one exists
    const { data: prescription } = await supabase
      .from("larinova_prescriptions")
      .select(
        `
        id, prescription_code, diagnosis, follow_up_date,
        allergy_warnings, doctor_notes,
        larinova_prescription_items (
          medicine_name, dosage, frequency, duration,
          route, food_timing, instructions, quantity
        )
      `,
      )
      .eq("consultation_id", consultationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let prescriptionSent = false;
    if (prescription && prescription.larinova_prescription_items?.length) {
      const rxResult = await sendPrescriptionEmail({
        patientEmail: patient.email,
        patientName: patient.full_name,
        doctorName: doctor.full_name,
        consultationDate,
        diagnosis: prescription.diagnosis || consultation.diagnosis || "",
        prescriptionCode: prescription.prescription_code,
        medicines: prescription.larinova_prescription_items as any[],
        followUpDate: prescription.follow_up_date || null,
        allergyWarnings: prescription.allergy_warnings || null,
        doctorNotes: prescription.doctor_notes || null,
      });
      prescriptionSent = rxResult.success;

      // Mark prescription as emailed
      if (rxResult.success) {
        await supabase
          .from("larinova_prescriptions")
          .update({ email_sent_at: new Date().toISOString() })
          .eq("id", prescription.id);
      }
    }

    return NextResponse.json({
      success: true,
      summarySent: true,
      prescriptionSent,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
