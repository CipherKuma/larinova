import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildSoapSystemPrompt } from "@/lib/soap/prompts";
import { chatSync } from "@/lib/ai/sarvam";
import type { Locale } from "@/src/i18n/routing";

export const maxDuration = 60;

// POST — generate a SOAP note from consultation transcripts
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: consultationId } = await params;
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get doctor record to determine locale
    const { data: doctor } = await supabase
      .from("larinova_doctors")
      .select("locale")
      .eq("user_id", user.id)
      .single();

    const locale: Locale = (doctor?.locale as Locale) ?? "in";

    // Fetch all transcripts for this consultation
    const { data: transcripts, error: transcriptsError } = await supabase
      .from("larinova_transcripts")
      .select("*")
      .eq("consultation_id", consultationId)
      .order("timestamp_start", { ascending: true });

    if (transcriptsError) {
      return NextResponse.json(
        { error: "Failed to fetch transcripts" },
        { status: 500 },
      );
    }

    if (!transcripts || transcripts.length === 0) {
      return NextResponse.json(
        { error: "No transcripts found for this consultation" },
        { status: 400 },
      );
    }

    // Fetch patient demographics for context
    const { data: consultationRecord } = await supabase
      .from("larinova_consultations")
      .select(
        "patient_id, larinova_patients!patient_id(full_name, gender, date_of_birth, blood_group)",
      )
      .eq("id", consultationId)
      .single();

    const patientInfo = consultationRecord?.larinova_patients as
      | {
          full_name: string;
          gender: string | null;
          date_of_birth: string | null;
          blood_group: string | null;
        }
      | null
      | undefined;

    // Build conversation text from transcripts
    const conversationText = transcripts
      .map((t) => `[${t.speaker?.toUpperCase() || "UNKNOWN"}]: ${t.text}`)
      .join("\n\n");

    // Build locale-aware system prompt
    const systemPrompt = buildSoapSystemPrompt(locale);

    // Build patient context block
    const patientContext = patientInfo
      ? [
          `Patient: ${patientInfo.full_name}`,
          patientInfo.gender ? `Gender: ${patientInfo.gender}` : null,
          patientInfo.date_of_birth
            ? `Date of Birth: ${patientInfo.date_of_birth}`
            : null,
          patientInfo.blood_group
            ? `Blood Group: ${patientInfo.blood_group}`
            : null,
        ]
          .filter(Boolean)
          .join("\n")
      : "";

    const prompt = patientContext
      ? `${patientContext}\n\nTranscribed Conversation:\n"""\n${conversationText}\n"""`
      : `Transcribed Conversation:\n"""\n${conversationText}\n"""`;

    let soapNote = "";
    try {
      const result = await chatSync({
        systemPrompt,
        prompt,
        maxTokens: 3000,
      });
      soapNote = result.text;
    } catch (e) {
      console.error("[soap-note] sarvam error:", e);
      return NextResponse.json(
        { error: "Failed to generate SOAP note" },
        { status: 502 },
      );
    }

    if (!soapNote.trim()) {
      return NextResponse.json(
        { error: "Empty SOAP note from inference" },
        { status: 502 },
      );
    }

    // Persist SOAP note with locale tag (continue even if save fails)
    await supabase
      .from("larinova_consultations")
      .update({
        soap_note: soapNote.trim(),
        soap_note_locale: locale,
        updated_at: new Date().toISOString(),
      })
      .eq("id", consultationId);

    return NextResponse.json({
      success: true,
      soapNote: soapNote.trim(),
      transcriptCount: transcripts.length,
      locale,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET — retrieve saved SOAP note for a consultation
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: consultationId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: consultation, error } = await supabase
      .from("larinova_consultations")
      .select("soap_note, soap_note_locale")
      .eq("id", consultationId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch SOAP note" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      soapNote: consultation?.soap_note || null,
      locale: consultation?.soap_note_locale || null,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
