import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await ctx.params;

  const { data: issue } = await supabase
    .from("larinova_issues")
    .select("id, title, body, status, priority, created_at, resolved_at")
    .eq("id", id)
    .maybeSingle();
  if (!issue) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: messages } = await supabase
    .from("larinova_issue_messages")
    .select("id, sender_role, body, created_at")
    .eq("issue_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ issue, messages: messages ?? [] });
}
