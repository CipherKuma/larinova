import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Params = { locale: string };
type Search = { invite?: string | string[] };

/**
 * Legacy entry point. New invite links go to /api/invite/accept and
 * never reach this page. Surviving cases:
 *   - Already-authed doctor → forward to onboarding/home.
 *   - Cookie already set → forward to sign-up.
 *   - ?invite=CODE on this URL (older emails) → forward to /api/invite/accept.
 *   - Anything else → back to the landing. We don't render a code form;
 *     the doctor experience is "tap the link in the email", not "type a code".
 */
export default async function AccessPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const inviteParam = Array.isArray(sp.invite) ? sp.invite[0] : sp.invite;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: doctor } = await supabase
      .from("larinova_doctors")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .single();
    if (doctor?.onboarding_completed) redirect(`/${locale}`);
    if (doctor) redirect(`/${locale}/onboarding`);
  }

  if (inviteParam) {
    redirect(
      `/api/invite/accept?code=${encodeURIComponent(inviteParam)}&locale=${locale}`,
    );
  }

  const cookieStore = await cookies();
  if (cookieStore.get("larinova_invite_token")?.value) {
    redirect(`/${locale}/sign-up`);
  }

  redirect(`/${locale}`);
}
