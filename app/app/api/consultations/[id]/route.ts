import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: consultationId } = await params;
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve the doctor for the authenticated user (defense-in-depth
    // ownership check — must hold even if RLS regresses).
    const { data: doctor } = await supabase
      .from("larinova_doctors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found", code: "doctor_not_found" },
        { status: 404 },
      );
    }

    // Fetch consultation with patient and doctor info — scoped to the
    // authenticated doctor so one doctor can never read another's record.
    const { data: consultation, error } = await supabase
      .from("larinova_consultations")
      .select(
        `
        *,
        patient:larinova_patients!larinova_consultations_patient_id_fkey(
          id,
          full_name,
          email,
          phone,
          date_of_birth,
          gender
        ),
        doctor:larinova_doctors!larinova_consultations_doctor_id_fkey(
          id,
          full_name,
          email,
          specialization
        )
      `,
      )
      .eq("id", consultationId)
      .eq("doctor_id", doctor.id)
      .single();

    if (error || !consultation) {
      return NextResponse.json(
        { error: "Consultation not found", code: "consultation_not_found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ consultation });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
