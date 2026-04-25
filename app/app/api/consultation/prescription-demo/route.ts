import { NextRequest, NextResponse } from "next/server";
import { chatSync, extractJson } from "@/lib/ai/sarvam";

export const maxDuration = 30;

interface PrescriptionMedicine {
  name: string;
  frequency: string;
  duration: string;
  timing: string;
}

interface PrescriptionData {
  patient_name: string;
  patient_sex: string;
  patient_age: string;
  medicines: PrescriptionMedicine[];
}

export async function POST(request: NextRequest) {
  try {
    const { soapNote, transcript, locale } = await request.json();

    if (!soapNote && !transcript) {
      return NextResponse.json(
        { error: "soapNote or transcript required" },
        { status: 400 },
      );
    }

    const isIndonesia = locale === "id";

    const prompt = `You are a medical prescription assistant. Based on the SOAP note and consultation transcript below, generate a realistic prescription.

IMPORTANT RULES:
1. Extract the patient's name from the transcript if mentioned. If no name is found, use "${isIndonesia ? "Siti Rahayu" : "Ravi Kumar"}" as the default.
2. Determine the patient's sex from context clues (pronouns, title like Mr/Mrs/Pak/Bu). Default to "${isIndonesia ? "F" : "M"}" if unclear.
3. Estimate the patient's age from context. Default to "45" if not mentioned.
4. Generate 2-4 appropriate medicines based on the diagnosis/assessment in the SOAP note.
5. Each medicine MUST have: name (drug name + dosage), frequency, duration, and timing.
6. Use REAL medicine names appropriate for the diagnosis. Do NOT use placeholder medicines.
7. ${isIndonesia ? 'Use Indonesian format: frequency as "3x1" or "2x1", duration in "hari", timing in Indonesian (e.g., "Sesudah makan", "Sebelum makan").' : 'Use Indian format: frequency as "1-0-1" or "1-1-1", duration in "days", timing in English (e.g., "After food", "Before food").'}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "patient_name": "Name Here",
  "patient_sex": "M" or "F",
  "patient_age": "45",
  "medicines": [
    {
      "name": "DRUG NAME DOSAGE",
      "frequency": "frequency",
      "duration": "duration",
      "timing": "timing"
    }
  ]
}

SOAP Note:
${soapNote ? JSON.stringify(soapNote) : "Not available"}

Consultation Transcript:
${transcript || "Not available"}`;

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

    return NextResponse.json({ prescription });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Prescription generation failed";
    console.error("[PRESCRIPTION-DEMO] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
