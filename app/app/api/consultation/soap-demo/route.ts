// Demo SOAP generation for onboarding preview — no consultation ID required.
// Used by the StepMagic onboarding step to show doctors a sample SOAP note.
// Full SOAP generation for real consultations is at /api/consultations/[id]/soap-note.

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { buildSoapDemoPrompt, getSoapFallback } from "@/lib/sarvam/prompts";
import { chatSync, extractJson } from "@/lib/ai/sarvam";
import type { Locale } from "@/src/i18n/routing";

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
    const body = await request.json();
    const { transcript, locale: rawLocale } = body;
    const locale: Locale = rawLocale === "id" ? "id" : "in";

    if (!transcript) {
      return NextResponse.json(
        { error: "transcript required" },
        { status: 400 },
      );
    }

    const soapPrompt = buildSoapDemoPrompt(locale);
    const fallback = getSoapFallback(locale);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const result = await chatSync({
        prompt: `${soapPrompt}\n\nTranscript:\n${transcript}`,
        maxTokens: 1500,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const aiText = result.text;
      if (!aiText.trim()) throw new Error("Empty response from AI");

      try {
        const soap = extractJson(aiText);
        return NextResponse.json({ soap, fallback: false });
      } catch {
        return NextResponse.json({
          soap: { ...fallback, subjective: aiText || transcript },
          fallback: true,
        });
      }
    } catch (e) {
      clearTimeout(timeout);
      console.error("[SOAP-DEMO] sarvam error:", e);
      return NextResponse.json({
        soap: { ...fallback, subjective: transcript },
        fallback: true,
      });
    }
  } catch {
    return NextResponse.json(
      { error: "SOAP demo generation failed" },
      { status: 500 },
    );
  }
}
