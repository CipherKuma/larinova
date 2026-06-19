import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chatSync } from "@/lib/ai/sarvam";
import {
  transcribeWithDiarization,
  inferSpeakerRoles,
  type DiarizedEntry,
} from "@/lib/sarvam/batch";

export const maxDuration = 300;

interface SimpleSegment {
  speaker: "doctor" | "patient";
  text: string;
  timestamp_start: number;
  timestamp_end: number;
}

export async function POST(
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

    // Try to read an audio file off the request. Two paths:
    //   - multipart with field "audio" → run real Sarvam Batch diarization
    //   - empty body / JSON          → fall back to LLM text-only diarization
    let audioFile: Blob | null = null;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const f = formData.get("audio");
      if (f && f instanceof Blob && f.size > 0) {
        audioFile = f;
      }
    }

    if (audioFile) {
      const apiKey = process.env.SARVAM_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "SARVAM_API_KEY not configured" },
          { status: 500 },
        );
      }
      try {
        const result = await transcribeWithDiarization(audioFile, {
          apiKey,
          languageCode: "unknown",
          model: "saaras:v3",
          numSpeakers: 2,
          inputAudioCodec: "webm",
          filename: `consultation-${consultationId}.webm`,
          intervalMs: 5000,
          timeoutMs: 4 * 60 * 1000,
        });
        const entries =
          result.entries || result.diarized_transcript?.entries || [];
        if (!entries.length) {
          return NextResponse.json(
            { error: "Sarvam returned no diarized entries" },
            { status: 502 },
          );
        }
        const roleByspeakerId = inferSpeakerRoles(entries);
        return await replaceTranscriptsWithDiarized(
          supabase,
          consultationId,
          entries,
          roleByspeakerId,
        );
      } catch (err) {
        console.error(
          "[diarize] Sarvam batch failed, falling back to LLM:",
          err,
        );
        // Fall through to LLM path
      }
    }

    // ---- Fallback: LLM-based text diarization on existing transcripts ----
    const { data: transcripts } = await supabase
      .from("larinova_transcripts")
      .select("*")
      .eq("consultation_id", consultationId)
      .order("timestamp_start", { ascending: true });

    if (!transcripts || transcripts.length === 0) {
      return NextResponse.json(
        { error: "No transcripts found for this consultation" },
        { status: 400 },
      );
    }

    const conversationWithTimestamps = transcripts
      .map(
        (t, index) =>
          `[${index + 1}] (${t.timestamp_start.toFixed(1)}s - ${t.timestamp_end.toFixed(1)}s): ${t.text}`,
      )
      .join("\n");

    const systemPrompt = `You are a medical conversation diarization expert. Analyze transcribed medical consultations and label each segment as "doctor" or "patient". Doctors ask questions, give medical advice, explain diagnoses, prescribe treatments. Patients describe symptoms, provide history, ask about their condition. Return ONLY a valid JSON array: [{"index": 1, "speaker": "doctor", "text": "original text"}, ...]. Rules: keep original text unchanged, speaker must be exactly "doctor" or "patient" (lowercase), include ALL segments in order, return ONLY the JSON array with no other text.`;
    const prompt = `Transcribed Conversation:\n"""\n${conversationWithTimestamps}\n"""`;

    let diarizedText = "";
    try {
      const result = await chatSync({ systemPrompt, prompt, maxTokens: 4000 });
      diarizedText = result.text;
    } catch (e) {
      return NextResponse.json(
        { error: `Inference service error: ${(e as Error).message}` },
        { status: 502 },
      );
    }

    if (!diarizedText.trim()) {
      return NextResponse.json(
        { error: "Empty response from inference" },
        { status: 502 },
      );
    }

    let llmSegments: Array<{
      index: number;
      speaker: "doctor" | "patient";
      text: string;
    }>;
    try {
      const jsonMatch = diarizedText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array in response");
      llmSegments = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse diarized conversation" },
        { status: 500 },
      );
    }

    const updatedTranscripts: SimpleSegment[] = [];
    await Promise.all(
      llmSegments.map(async (seg) => {
        const original = transcripts[seg.index - 1];
        if (!original) return;
        await supabase
          .from("larinova_transcripts")
          .update({ speaker: seg.speaker })
          .eq("id", original.id);
        updatedTranscripts.push({
          speaker: seg.speaker,
          text: original.text,
          timestamp_start: original.timestamp_start,
          timestamp_end: original.timestamp_end,
        });
      }),
    );

    await supabase
      .from("larinova_consultations")
      .update({ diarized: true, updated_at: new Date().toISOString() })
      .eq("id", consultationId);

    return NextResponse.json({
      success: true,
      method: "llm-text",
      transcripts: updatedTranscripts,
      segmentCount: updatedTranscripts.length,
    });
  } catch (e) {
    console.error("[diarize] error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function replaceTranscriptsWithDiarized(
  supabase: Awaited<ReturnType<typeof createClient>>,
  consultationId: string,
  entries: DiarizedEntry[],
  roleByspeakerId: Record<string, "doctor" | "patient">,
) {
  // Audio diarization replaces the transcript timeline with the higher-quality
  // batch transcription. This is a destructive replace, so order matters: we
  // INSERT the diarized rows FIRST and only DELETE the prior live rows once the
  // insert is confirmed persisted. If diarization yields nothing usable, we
  // keep the live transcript untouched — never trade a real transcript for an
  // empty one. (The Supabase JS client has no client-side multi-statement
  // transaction, so we sequence carefully and delete only the captured old ids.)

  const rows = entries
    .filter((e) => e.transcript && e.transcript.trim())
    .map((e) => ({
      consultation_id: consultationId,
      speaker: roleByspeakerId[e.speaker_id] || "unknown",
      text: e.transcript.trim(),
      language: "auto",
      confidence: 0.95,
      timestamp_start: e.start_time_seconds || 0,
      timestamp_end: e.end_time_seconds || 0,
    }));

  // No usable diarized rows → do NOT delete the existing live transcript.
  if (rows.length === 0) {
    console.warn(
      "[diarize] no usable diarized rows; keeping existing live transcript",
    );
    return NextResponse.json(
      { error: "Diarization produced no usable segments" },
      { status: 502 },
    );
  }

  // Capture the ids of the existing live rows BEFORE inserting, so we can
  // delete exactly those (and not the diarized rows we're about to insert).
  const { data: existingRows } = await supabase
    .from("larinova_transcripts")
    .select("id")
    .eq("consultation_id", consultationId);
  const oldIds: string[] = (existingRows || []).map(
    (r: { id: string }) => r.id,
  );

  // 1. Insert the diarized rows first and confirm they actually persisted
  // (no error AND rows returned).
  const { data: insertedRows, error: insertError } = await supabase
    .from("larinova_transcripts")
    .insert(rows)
    .select("id");
  if (insertError || !insertedRows || insertedRows.length === 0) {
    console.error(
      "[diarize] insert error; keeping existing live transcript:",
      insertError,
    );
    // Best-effort rollback of any partial insert so we don't leave duplicate
    // diarized rows alongside the preserved live transcript.
    if (insertedRows && insertedRows.length > 0) {
      const newIds = insertedRows.map((r: { id: string }) => r.id);
      await supabase.from("larinova_transcripts").delete().in("id", newIds);
    }
    return NextResponse.json(
      { error: "Failed to save diarized transcripts" },
      { status: 500 },
    );
  }

  // 2. Insert confirmed persisted → now safe to delete the prior live rows.
  if (oldIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("larinova_transcripts")
      .delete()
      .in("id", oldIds);
    if (deleteError) {
      // The diarized rows are saved; we just couldn't remove the old ones.
      // Surface it, but the transcript data is not lost.
      console.error("[diarize] delete of old transcripts failed:", deleteError);
    }
  }

  await supabase
    .from("larinova_consultations")
    .update({ diarized: true, updated_at: new Date().toISOString() })
    .eq("id", consultationId);

  return NextResponse.json({
    success: true,
    method: "sarvam-batch-diarization",
    transcripts: rows,
    segmentCount: rows.length,
  });
}
