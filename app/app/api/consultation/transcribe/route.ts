import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transcribeAudio } from "@/lib/sarvam/client";
import { getTranscriptionProvider } from "@/lib/transcription";

// Verbose STT tracing is opt-in. It must never carry transcript text/PHI —
// only non-content metadata (sizes, locale, provider) and only when enabled.
const STT_DEBUG = process.env.DEBUG_STT === "1";
function sttDebug(...args: unknown[]) {
  if (STT_DEBUG) console.error(...args);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as Blob | null;
    const languageCode = (formData.get("language_code") as string) || "unknown";
    const clientLocale = formData.get("locale") as string | null;

    const { data: doctor } = await supabase
      .from("larinova_doctors")
      .select("locale")
      .eq("user_id", user.id)
      .single();

    const locale: "in" | "id" =
      doctor?.locale === "id" ? "id" : clientLocale === "id" ? "id" : "in";

    sttDebug("[TRANSCRIBE] Request:", {
      locale,
      languageCode,
      clientLocale,
      doctorLocale: doctor?.locale,
      fileSize: file?.size ?? 0,
      fileType: file?.type ?? "none",
    });

    if (!file) {
      sttDebug("[TRANSCRIBE] No audio file in request");
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      sttDebug("[TRANSCRIBE] Audio file is empty (0 bytes)");
      return NextResponse.json(
        { error: "Audio file is empty" },
        { status: 400 },
      );
    }

    if (locale === "in") {
      // India: Sarvam chunk-based transcription
      const apiKey = process.env.SARVAM_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "SARVAM_API_KEY not configured" },
          { status: 500 },
        );
      }
      sttDebug("[TRANSCRIBE] Using Sarvam for India locale");
      const result = await transcribeAudio(apiKey, file, languageCode);
      sttDebug("[TRANSCRIBE] Sarvam result:", {
        transcriptLength: result.transcript?.length ?? 0,
      });
      return NextResponse.json(result);
    }

    // Indonesia: Deepgram batch transcription (full audio)
    sttDebug("[TRANSCRIBE] Using Deepgram batch for Indonesia locale");
    const provider = getTranscriptionProvider("id");
    if (provider.mode !== "batch") {
      return NextResponse.json(
        { error: "Invalid provider mode" },
        { status: 500 },
      );
    }
    const result = await provider.transcribe(file, { language: "id" });
    sttDebug("[TRANSCRIBE] Deepgram result:", {
      transcriptLength: result.transcript?.length ?? 0,
      segmentCount: result.segments?.length ?? 0,
    });
    return NextResponse.json({
      transcript: result.transcript,
      segments: result.segments,
      language_code: "id",
      provider: "deepgram",
    });
  } catch (error: unknown) {
    // Log the error internally (no transcript/PHI — just the error object).
    console.error("[TRANSCRIBE] ERROR:", error);
    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 },
    );
  }
}
