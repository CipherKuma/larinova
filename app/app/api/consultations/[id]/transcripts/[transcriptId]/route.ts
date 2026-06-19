import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; transcriptId: string }> },
) {
  try {
    const { id: consultationId, transcriptId } = await params;
    const { text, translation, timestamp_end } = await req.json();

    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve the doctor and verify the parent consultation belongs to them
    // (transcripts carry no doctor_id, so ownership is enforced via the
    // consultation — defense-in-depth that must hold even if RLS regresses).
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

    const { data: ownedConsultation } = await supabase
      .from("larinova_consultations")
      .select("id")
      .eq("id", consultationId)
      .eq("doctor_id", doctor.id)
      .single();

    if (!ownedConsultation) {
      return NextResponse.json(
        { error: "Consultation not found", code: "consultation_not_found" },
        { status: 404 },
      );
    }

    // Update transcript in database — scoped to the owned consultation so a
    // doctor can never edit a transcript outside their own consult.
    const { data: transcript, error } = await supabase
      .from("larinova_transcripts")
      .update({
        text,
        translation: translation || null,
        timestamp_end: timestamp_end || 0,
      })
      .eq("id", transcriptId)
      .eq("consultation_id", consultationId)
      .select()
      .single();

    if (error || !transcript) {
      return NextResponse.json(
        { error: "Transcript not found", code: "transcript_not_found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, transcript });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
