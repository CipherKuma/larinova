import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: consultationId } = await params;
    const {
      speaker,
      text,
      translation,
      confidence,
      timestamp_start,
      timestamp_end,
      language,
    } = await req.json();

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

    // Save transcript to database
    const { data: transcript, error } = await supabase
      .from("larinova_transcripts")
      .insert({
        consultation_id: consultationId,
        speaker: speaker || "unknown",
        text,
        translation: translation || null,
        language: language || "en",
        confidence: confidence || 0,
        timestamp_start: timestamp_start || 0,
        timestamp_end: timestamp_end || 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to save transcript" },
        { status: 500 },
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

// Get all transcripts for a consultation
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

    // Resolve the doctor and verify the parent consultation belongs to them
    // before exposing any transcript text (defense-in-depth — must hold even
    // if RLS regresses).
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

    const { data: transcripts, error } = await supabase
      .from("larinova_transcripts")
      .select("*")
      .eq("consultation_id", consultationId)
      .order("timestamp_start", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch transcripts", code: "transcripts_fetch_failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({ transcripts });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
