// Demo SOAP generation for onboarding preview — no consultation ID required.
// Used by the StepMagic onboarding step to show doctors a sample SOAP note.
// Full SOAP generation for real consultations is at /api/consultations/[id]/soap-note.

import { NextRequest, NextResponse } from "next/server";
import { buildSoapDemoPrompt, getSoapFallback } from "@/lib/sarvam/prompts";
import { chatSync, extractJson } from "@/lib/ai/sarvam";
import type { Locale } from "@/src/i18n/routing";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
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
