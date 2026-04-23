import { NextRequest, NextResponse } from "next/server";
import { notify } from "@/lib/notify";
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

    // Send email via unified notify()
    const result = await notify(
      "email",
      "consultation_summary",
      {
        patientName: consultation.patient.full_name,
        doctorName: consultation.doctor.full_name,
        consultationDate,
        plainSummary: consultation.summary || "No summary available",
        diagnosis: consultation.diagnosis || undefined,
      },
      {
        email: consultation.patient.email,
        patientId: consultation.patient.id,
        doctorId: consultation.doctor.id,
        name: consultation.patient.full_name,
      },
      {
        relatedEntityType: "consultation",
        relatedEntityId: consultationId,
      },
    );

    if (result.status === "failed") {
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
      messageId: result.messageId,
      providerMsgId: result.providerMsgId,
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
