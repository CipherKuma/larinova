import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { chatSync, extractJson } from "@/lib/ai/sarvam";
import {
  buildPrescriptionDemoPrompt,
  hasExplicitMedicineMention,
  sanitizePrescriptionDemo,
  sourceTextForPrescription,
  type PrescriptionData,
} from "@/lib/onboarding/prescription-demo";

export const maxDuration = 30;

// This endpoint is intentionally UNAUTHENTICATED (onboarding preview) and calls
// the LLM, so it is a cost/abuse vector. Throttle with an in-memory token bucket
// keyed by a hashed client IP. Per-instance and best-effort — good enough to cap
// casual abuse without external infra; harden with a shared store if we ever run
// many instances behind the demo endpoint.
const RATE_BUCKET = new Map<string, { count: number; windowStart: number }>();
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT = 10; // max requests per IP per window

function hashIp(ip: string): string {
  const secret = process.env.ANALYTICS_IP_SECRET ?? "no-secret-set";
  return crypto
    .createHash("sha256")
    .update(ip + ":" + secret)
    .digest("hex")
    .slice(0, 32);
}

function rateLimited(req: NextRequest): boolean {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip")?.trim() ??
    "unknown";
  const key = hashIp(ip);
  const now = Date.now();
  const b = RATE_BUCKET.get(key);
  if (!b || now - b.windowStart > RATE_WINDOW_MS) {
    RATE_BUCKET.set(key, { count: 1, windowStart: now });
    return false;
  }
  b.count += 1;
  return b.count > RATE_LIMIT;
}

export async function POST(request: NextRequest) {
  if (rateLimited(request)) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": "3600" } },
    );
  }

  try {
    const { soapNote, transcript, locale } = await request.json();

    if (!soapNote && !transcript) {
      return NextResponse.json(
        { error: "soapNote or transcript required" },
        { status: 400 },
      );
    }

    const sourceText = sourceTextForPrescription(soapNote, transcript);
    // Always call the AI so patient name/age/sex are extracted from the transcript.
    // sanitizePrescriptionDemo zeroes medicines when no explicit medicine is mentioned,
    // so the P0 guard still holds — we just don't skip demographics extraction.
    const hasMedicine = hasExplicitMedicineMention(sourceText);

    const prompt = buildPrescriptionDemoPrompt({
      soapNote,
      transcript,
      locale,
    });

    let aiText = "";
    try {
      const result = await chatSync({ prompt, maxTokens: 1500 });
      aiText = result.text;
    } catch (e) {
      console.error("[PRESCRIPTION-DEMO] sarvam error:", e);
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 502 },
      );
    }

    if (!aiText.trim()) {
      console.error("[PRESCRIPTION-DEMO] Empty AI response");
      return NextResponse.json({ error: "Empty AI response" }, { status: 502 });
    }

    let prescription: PrescriptionData;
    try {
      prescription = extractJson<PrescriptionData>(aiText);
    } catch {
      console.error(
        "[PRESCRIPTION-DEMO] Failed to parse:",
        aiText.substring(0, 200),
      );
      return NextResponse.json(
        { error: "Failed to parse prescription data" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      prescription: sanitizePrescriptionDemo(prescription, sourceText, locale),
      medicineSource: hasMedicine ? "explicit_only" : "none_explicit",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Prescription generation failed";
    console.error("[PRESCRIPTION-DEMO] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
