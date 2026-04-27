import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { redeemInviteCode } from "@/lib/invite";
import { trackMilestone } from "@/lib/analytics/server";

const Body = z.object({
  code: z.string().trim().min(6).max(40),
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
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const result = await redeemInviteCode(supabase, parsed.code.toUpperCase());

  if (!result.ok) {
    const status = result.error === "unauthenticated" ? 401 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  // The welcome-with-invite-code email is sent at admin invite-time
  // (POST /api/admin/codes/invite). The doctor has already received it
  // before reaching this redemption step, so we DON'T re-send here —
  // avoids duplicate-email noise.

  if (!result.already_redeemed) {
    trackMilestone("invite_redeemed", {
      userId: user.id,
      properties: {
        code: parsed.code.toUpperCase(),
        period_end: result.period_end,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    period_end: result.period_end,
    already_redeemed: result.already_redeemed,
  });
}
