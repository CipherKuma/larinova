import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/auth";

const PatchBody = z.object({
  status: z.enum(["open", "in_progress", "resolved", "wont_fix"]).optional(),
  priority: z.enum(["low", "normal", "high"]).optional(),
});

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { id } = await ctx.params;

  const sb = adminClient();
  const { data: issue } = await sb
    .from("larinova_issues")
    .select(
      "id, title, body, status, priority, created_at, resolved_at, doctor_id, larinova_doctors!inner(full_name, email)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!issue) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { data: messages } = await sb
    .from("larinova_issue_messages")
    .select("id, sender_role, body, created_at")
    .eq("issue_id", id)
    .order("created_at", { ascending: true });
  return NextResponse.json({ issue, messages: messages ?? [] });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { id } = await ctx.params;

  let parsed: z.infer<typeof PatchBody>;
  try {
    parsed = PatchBody.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const sb = adminClient();
  const { error } = await sb
    .from("larinova_issues")
    .update(parsed)
    .eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
