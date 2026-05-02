"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();

      // PKCE: when arriving from a Supabase verify/magic link, the URL carries
      // ?code=<auth_code>. Exchange it for a session BEFORE getUser, otherwise
      // the session never exists and getUser returns null → endless /sign-in
      // bounce.
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        // For OAuth callbacks the code MUST be exchanged client-side. For
        // magic-link / OTP flows the session is already set by Supabase's
        // verify endpoint via Set-Cookie, and the code_verifier may not be
        // in this client's storage — we swallow that error and let getUser
        // confirm the session below.
        await supabase.auth.exchangeCodeForSession(code).catch(() => {});
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push(`/${locale}/sign-in`);
        return;
      }

      // If this callback came from invite signup, claim first while the invite
      // cookie is still present. Then read the doctor row.
      await fetch("/api/invite/claim", { method: "POST" }).catch(() => {});

      // Check if doctor profile exists
      const { data: doctor } = await supabase
        .from("larinova_doctors")
        .select(
          "onboarding_completed, invite_code_claimed_at, invite_code_redeemed_at",
        )
        .eq("user_id", user.id)
        .maybeSingle();
      const hasAlphaDoctorAccess = Boolean(
        doctor?.invite_code_claimed_at || doctor?.invite_code_redeemed_at,
      );

      if (!doctor || !hasAlphaDoctorAccess) {
        await supabase.auth.signOut();
        router.push(`/${locale}/sign-in`);
        return;
      }

      if (!doctor || !doctor.onboarding_completed) {
        router.push(`/${locale}/onboarding`);
      } else {
        router.push(`/${locale}`);
      }
    };

    handleCallback();
  }, [router, locale]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}
