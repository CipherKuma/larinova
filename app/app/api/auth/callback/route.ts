import { createClient } from "@/lib/supabase/server";
import { upgradeIfWhitelisted } from "@/lib/subscription";
import { notify } from "@/lib/notify";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/in/auth/callback";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Run whitelist upgrade in the background; don't block login on it.
      void runWhitelistUpgrade();
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/in/sign-in`);
}

async function runWhitelistUpgrade() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return;

    const { data: doctor } = await supabase
      .from("larinova_doctors")
      .select("id, email, full_name")
      .eq("user_id", user.id)
      .single();
    if (!doctor) return;

    await upgradeIfWhitelisted(user.email, doctor.id, async () => {
      const result = await notify(
        "email",
        "welcome_alpha",
        { doctorName: doctor.full_name },
        { email: doctor.email, doctorId: doctor.id, name: doctor.full_name },
      );
      return result.status === "sent" || result.status === "simulated";
    });
  } catch (err) {
    console.error("whitelist upgrade failed:", err);
  }
}
