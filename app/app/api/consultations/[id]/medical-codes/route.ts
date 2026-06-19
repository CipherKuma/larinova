import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAIUsage, recordAIUsage } from "@/lib/subscription";
import { chatSync, extractJson } from "@/lib/ai/sarvam";
import { CLINICAL_TRANSCRIPT_BOUNDARY_RULES } from "@/lib/consultation/transcript-safety";

export const maxDuration = 30;

interface CodeItem {
  code: string;
  description: string;
}

interface MedicalCodesResponse {
  icd10: CodeItem[];
  snomed: CodeItem[];
  cpt: CodeItem[];
}

// ICD-10-CM/PCS format: letter (no U placeholder), digit, alphanumeric, then
// an optional dotted extension. Catches obvious hallucinations like "DIABETES"
// or "12.3" before they are persisted to a billable clinical record.
const ICD10_REGEX = /^[A-TV-Z][0-9][0-9AB](\.[0-9A-TV-Z]{1,4})?$/;
// CPT / HCPCS Category I-III: 5 chars, four digits + a trailing digit or
// letter (e.g. 99213, 0001F, 0001T, 0001U).
const CPT_REGEX = /^[0-9]{4}[0-9A-Z]$/;
// SNOMED CT concept ids are 6-18 digit integers.
const SNOMED_REGEX = /^[0-9]{6,18}$/;

/**
 * Format-validate the LLM-generated codes before persistence. Malformed codes
 * are dropped (not silently kept) so a hallucinated value never lands in a
 * patient's billing/clinical record. Returns the cleaned response plus a count
 * of how many entries were rejected, for observability without logging PHI.
 */
function sanitizeMedicalCodes(raw: unknown): {
  codes: MedicalCodesResponse;
  dropped: number;
} {
  let dropped = 0;

  const clean = (
    list: unknown,
    pattern: RegExp,
  ): CodeItem[] => {
    if (!Array.isArray(list)) return [];
    const seen = new Set<string>();
    const out: CodeItem[] = [];
    for (const item of list) {
      const code =
        typeof item?.code === "string" ? item.code.trim().toUpperCase() : "";
      const description =
        typeof item?.description === "string" ? item.description.trim() : "";
      if (!code || !pattern.test(code) || seen.has(code)) {
        dropped += 1;
        continue;
      }
      seen.add(code);
      out.push({ code, description });
    }
    return out;
  };

  const source = (raw ?? {}) as Partial<MedicalCodesResponse>;
  return {
    codes: {
      icd10: clean(source.icd10, ICD10_REGEX),
      cpt: clean(source.cpt, CPT_REGEX),
      snomed: clean(source.snomed, SNOMED_REGEX),
    },
    dropped,
  };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: consultationId } = await params;
    const { soapNote } = await req.json();

    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check AI usage limits
    const { data: doctor } = await supabase
      .from("larinova_doctors")
      .select("id, locale")
      .eq("user_id", user.id)
      .single();

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Verify the consultation belongs to this doctor (defense-in-depth —
    // must hold even if RLS regresses) before reading the SOAP note or
    // generating any billable codes.
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

    const usage = await checkAIUsage(doctor.id, "medical_codes");
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error:
            "Free trial limit reached for medical code generation. Upgrade to Pro for unlimited access.",
          usage,
          upgrade_required: true,
        },
        { status: 403 },
      );
    }

    // If no SOAP note provided, try to get it from the database (scoped to the
    // already-verified owned consultation).
    let finalSoapNote = soapNote;
    if (!finalSoapNote) {
      const { data: consultation, error } = await supabase
        .from("larinova_consultations")
        .select("soap_note")
        .eq("id", consultationId)
        .eq("doctor_id", doctor.id)
        .single();

      if (error || !consultation?.soap_note) {
        return NextResponse.json(
          { error: "No SOAP note found. Please generate a SOAP note first." },
          { status: 400 },
        );
      }

      finalSoapNote = consultation.soap_note;
    }

    const locale = (doctor.locale as string) ?? "in";
    const isId = locale === "id";
    const lang = isId ? "Bahasa Indonesia" : "English";

    const systemPrompt = `You are a medical coding AI. Extract ICD-10 and CPT codes from SOAP notes. Return ONLY a valid JSON object: {"icd10": [{"code": "X00.0", "description": "brief condition name in ${lang}"}], "cpt": [{"code": "00000", "description": "brief procedure name in ${lang}"}]}. Rules: ICD-10 for all diagnoses (primary first), CPT for office visit + any procedures/tests ordered, valid official codes only, descriptions 3-6 words in ${lang}, return ONLY the JSON with no other text.\n\n${CLINICAL_TRANSCRIPT_BOUNDARY_RULES}`;

    const prompt = `Extract medical codes from this SOAP note:\n\n${finalSoapNote}`;

    let codesText = "";
    try {
      const result = await chatSync({ systemPrompt, prompt, maxTokens: 1500 });
      codesText = result.text;
    } catch (e) {
      console.error("[medical-codes] sarvam error:", e);
      return NextResponse.json(
        { error: "Failed to extract medical codes" },
        { status: 502 },
      );
    }

    if (!codesText.trim()) {
      return NextResponse.json(
        { error: "Empty response from inference" },
        { status: 502 },
      );
    }

    let rawCodes: unknown;
    try {
      rawCodes = extractJson<MedicalCodesResponse>(codesText);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse medical codes from response", code: "parse_failed" },
        { status: 500 },
      );
    }

    // Format-validate the LLM output and drop clearly-malformed codes before
    // they land in a billable clinical record (P1-2).
    const { codes: medicalCodes, dropped } = sanitizeMedicalCodes(rawCodes);

    if (dropped > 0) {
      // Code count only — never the codes or any PHI.
      console.warn(
        `[medical-codes] dropped ${dropped} malformed code(s) before persistence`,
      );
    }

    // Update consultation with the validated medical codes
    await supabase
      .from("larinova_consultations")
      .update({
        medical_codes: medicalCodes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", consultationId)
      .eq("doctor_id", doctor.id);

    // Record AI usage
    await recordAIUsage(doctor.id, "medical_codes", consultationId);

    return NextResponse.json({
      success: true,
      medicalCodes,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Get the saved medical codes for a consultation
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

    // Resolve the doctor so the codes can be scoped to their owner.
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

    const { data: consultation, error } = await supabase
      .from("larinova_consultations")
      .select("medical_codes")
      .eq("id", consultationId)
      .eq("doctor_id", doctor.id)
      .single();

    if (error || !consultation) {
      return NextResponse.json(
        { error: "Consultation not found", code: "consultation_not_found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      medicalCodes: consultation.medical_codes || null,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
