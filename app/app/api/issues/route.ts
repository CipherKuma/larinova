import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendIssueFiledEmail } from "@/lib/notify/issue-filed-email";
import { trackMilestone } from "@/lib/analytics/server";

const Body = z.object({
  title: z.string().trim().min(3).max(140),
  body: z.string().trim().min(1).max(5000),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: doctor } = await supabase
    .from("larinova_doctors")
    .select("id, full_name, email")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!doctor)
    return NextResponse.json({ error: "no_doctor_row" }, { status: 400 });

  const { data: issue, error } = await supabase
    .from("larinova_issues")
    .insert({
      doctor_id: doctor.id,
      title: parsed.title,
      body: parsed.body,
      priority: parsed.priority,
    })
    .select("id")
    .single();
  if (error || !issue)
    return NextResponse.json(
      { error: error?.message ?? "insert_failed" },
      { status: 500 },
    );

  // fire-and-forget
  sendIssueFiledEmail({
    doctor: { full_name: doctor.full_name, email: doctor.email },
    issue: {
      id: issue.id,
      title: parsed.title,
      body: parsed.body,
      priority: parsed.priority,
    },
  }).catch((e) => console.error("[issues] email send failed:", e));

  trackMilestone("issue_filed", {
    userId: user.id,
    properties: { issue_id: issue.id, priority: parsed.priority },
  });

  return NextResponse.json({ ok: true, id: issue.id });
}
