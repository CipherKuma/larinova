import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const COOKIE_NAME = "larinova_invite_token";
const COOKIE_MAX_AGE = 60 * 60 * 6; // 6 hours

/**
 * One-tap entry point from the welcome email. Validates the code,
 * sets the invite cookie, and forwards straight to sign-up — the
 * doctor never sees a code field.
 *
 * Failure modes redirect to the locale landing with ?invite_error=…
 * since the manual code-entry path was retired alongside this route.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const rawCode = url.searchParams.get("code")?.trim() ?? "";
  const requestedLocale = (
    url.searchParams.get("locale") ?? "in"
  ).toLowerCase();
  const safeLocale = requestedLocale === "id" ? "id" : "in";
  const origin = url.origin;

  if (!rawCode) {
    return NextResponse.redirect(`${origin}/${safeLocale}`);
  }

  const code = rawCode.toUpperCase();

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data, error } = await supabase.rpc("validate_invite_code", {
    p_code: code,
  });

  if (error || !data?.ok) {
    return NextResponse.redirect(
      `${origin}/${safeLocale}?invite_error=invalid_or_used`,
    );
  }

  const res = NextResponse.redirect(`${origin}/${safeLocale}/sign-up`);
  res.cookies.set(COOKIE_NAME, code, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
