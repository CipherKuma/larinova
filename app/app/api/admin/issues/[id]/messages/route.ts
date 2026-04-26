import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/auth";

const Body = z.object({ body: z.string().trim().min(1).max(5000) });

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { id } = await ctx.params;

  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { error } = await sb.from("larinova_issue_messages").insert({
    issue_id: id,
    sender_role: "admin",
    sender_user_id: admin.id,
    body: parsed.body,
  });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // touch updated_at on the issue
  await sb
    .from("larinova_issues")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
