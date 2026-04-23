import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Intake templates CRUD for the authenticated doctor.
 *
 * GET  → list templates owned by the logged-in doctor.
 * POST → upsert a single template (v1 enforces one-per-doctor, is_default=true).
 *        Body is shallow-validated; field definitions are an opaque JSON array
 *        that the builder component shapes.
 */

const FIELD_TYPES = [
  "short_text",
  "long_text",
  "single_select",
  "multi_select",
  "number",
  "date",
  "yes_no",
  "file",
] as const;

const fieldSchema = z.object({
  id: z.string().min(1),
  type: z.enum(FIELD_TYPES),
  label: z.string().min(1).max(200),
  required: z.boolean().default(false),
  options: z.array(z.string().min(1).max(200)).optional(),
  placeholder: z.string().max(200).optional(),
});

const bodySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  fields: z.array(fieldSchema).min(1).max(40),
  locale: z.enum(["in", "id"]).optional(),
});

async function getDoctorId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("larinova_doctors")
    .select("id")
    .eq("user_id", user.id)
    .single();
  return data?.id as string | undefined;
}

export async function GET() {
  const doctorId = await getDoctorId();
  if (!doctorId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("larinova_intake_templates")
    .select("id, title, description, fields, is_default, locale, updated_at")
    .eq("doctor_id", doctorId)
    .order("updated_at", { ascending: false });
  if (error) {
    return NextResponse.json(
      { error: "fetch_failed", detail: error.message },
      { status: 500 },
    );
  }
  return NextResponse.json({ templates: data ?? [] });
}

export async function POST(req: NextRequest) {
  const doctorId = await getDoctorId();
  if (!doctorId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "invalid_body", detail: String(err) },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const payload = {
    doctor_id: doctorId,
    title: parsed.title,
    description: parsed.description ?? null,
    fields: parsed.fields,
    is_default: true,
    locale: parsed.locale ?? "in",
    updated_at: new Date().toISOString(),
  };

  if (parsed.id) {
    const { data, error } = await admin
      .from("larinova_intake_templates")
      .update(payload)
      .eq("id", parsed.id)
      .eq("doctor_id", doctorId)
      .select("id")
      .single();
    if (error || !data) {
      return NextResponse.json(
        { error: "update_failed", detail: error?.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ id: data.id });
  }

  // Insert path: clear existing default (one-default-per-doctor invariant) then insert.
  await admin
    .from("larinova_intake_templates")
    .update({ is_default: false })
    .eq("doctor_id", doctorId);

  const { data, error } = await admin
    .from("larinova_intake_templates")
    .insert(payload)
    .select("id")
    .single();
  if (error || !data) {
    return NextResponse.json(
      { error: "insert_failed", detail: error?.message },
      { status: 500 },
    );
  }
  return NextResponse.json({ id: data.id }, { status: 201 });
}
