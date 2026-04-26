import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  let q = sb
    .from("larinova_issues")
    .select(
      "id, title, status, priority, created_at, updated_at, doctor_id, larinova_doctors!inner(full_name, email)",
    )
    .order("updated_at", { ascending: false })
    .limit(200);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ issues: data ?? [] });
}
