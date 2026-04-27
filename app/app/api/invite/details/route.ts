import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const COOKIE_NAME = "larinova_invite_token";

/**
 * Returns the recipient details (first/last/email) stored on the invite
 * code currently held in the larinova_invite_token cookie. Used by the
 * sign-up form to pre-fill the doctor's name + email fields.
 *
 * Pre-auth route. Gated by possession of the HTTP-only cookie — the
 * cookie itself was set by /api/invite/validate after confirming the
 * code is unredeemed, so reading it back here is safe.
 *
 * Only returns details for codes that are still claimable (not consumed,
 * not redeemed). For consumed codes we return 404 — the user has already
 * redeemed and shouldn't be on the sign-up page anyway.
 */
export async function GET() {
  const cookieStore = await cookies();
  const code = cookieStore.get(COOKIE_NAME)?.value;
  if (!code) {
    return NextResponse.json({ error: "no_invite_token" }, { status: 404 });
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data, error } = await supabase
    .from("larinova_invite_codes")
    .select("first_name, last_name, email, consumed_at, redeemed_at")
    .eq("code", code.toUpperCase())
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (data.consumed_at || data.redeemed_at) {
    return NextResponse.json({ error: "already_used" }, { status: 410 });
  }

  return NextResponse.json({
    ok: true,
    firstName: data.first_name ?? null,
    lastName: data.last_name ?? null,
    email: data.email ?? null,
  });
}
