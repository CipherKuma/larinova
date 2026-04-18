import { NextRequest, NextResponse } from "next/server";
import { sendConsultationSummary } from "@/lib/resend/email";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { consultationId } = await req.json();

    if (!consultationId) {
      return NextResponse.json(
        { error: "Missing consultation ID" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Fetch consultation details with all related data
    const { data: consultation, error: consultationError } = await supabase
      .from("larinova_consultations")
      .select(
        `
        *,
        patient:larinova_patients(*),
        doctor:larinova_doctors(*),
        prescription:larinova_prescriptions(
          *,
          items:larinova_prescription_items(*)
        )
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

    // Validate required data
    if (!consultation.patient?.email) {
      return NextResponse.json(
        { error: "Patient email not found" },
        { status: 400 },
      );
    }

    // Format consultation date
    const consultationDate = new Date(
      consultation.start_time,
    ).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Send email
    const result = await sendConsultationSummary({
      patientEmail: consultation.patient.email,
      patientName: consultation.patient.full_name,
      doctorName: consultation.doctor.full_name,
      consultationDate,
      summary: consultation.summary || "No summary available",
      diagnosis: consultation.diagnosis || "No specific diagnosis recorded",
      prescriptions: consultation.prescription?.[0]?.items || [],
      doctorNotes: consultation.prescription?.[0]?.doctor_notes,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 },
      );
    }

    // Update prescription with email sent timestamp
    if (consultation.prescription?.[0]?.id) {
      await supabase
        .from("larinova_prescriptions")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("id", consultation.prescription[0].id);
    }

    return NextResponse.json({
      success: true,
      message: "Consultation summary sent successfully",
      data: result.data,
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
