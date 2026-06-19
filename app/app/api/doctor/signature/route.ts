import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Persists the authenticated doctor's reusable signature (typed-cursive or
// drawn PNG), stored as a data URL on larinova_doctors.signature_image_url.
// See migration 20260619000100_doctor_signature.sql.
const schema = z.object({
  // PNG data URL (drawn / typed) — keep a generous cap for a small signature.
  signature_image_url: z
    .string()
    .trim()
    .min(1)
    .max(1_500_000)
    .refine((v) => v.startsWith("data:image/") || /^https?:\/\//.test(v), {
      message: "must be a data URL or https URL",
    })
    .nullable(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "unauthorized" },
        { status: 401 },
      );
    }

    const { data: doctor, error } = await supabase
      .from("larinova_doctors")
      .update({ signature_image_url: body.signature_image_url })
      .eq("user_id", user.id)
      .select("id, signature_image_url")
      .single();

    if (error || !doctor) {
      return NextResponse.json(
        { error: "Doctor not found", code: "doctor_not_found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      signature_image_url: doctor.signature_image_url,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid signature", code: "invalid_body" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error", code: "internal_error" },
      { status: 500 },
    );
  }
}
