import { isAdminEmail } from "@/lib/admin";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    const normalizedEmail = String(email).trim().toLowerCase();

    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    );

    // Doctor-app access requires both a doctor profile and alpha invite state.
    // Admin Auth alone must not receive a doctor-app OTP.
    const { data: doctor } = await supabase
      .from("larinova_doctors")
      .select(
        "id, onboarding_completed, invite_code_claimed_at, invite_code_redeemed_at",
      )
      .eq("email", normalizedEmail)
      .maybeSingle();
    const hasAlphaDoctorAccess = Boolean(
      doctor?.invite_code_claimed_at || doctor?.invite_code_redeemed_at,
    );

    return NextResponse.json({
      exists: hasAlphaDoctorAccess,
      hasDoctorProfile: !!doctor,
      isAdmin: isAdminEmail(normalizedEmail),
      onboardingCompleted: doctor?.onboarding_completed ?? false,
    });
  } catch {
    return NextResponse.json({
      exists: false,
      isAdmin: false,
      onboardingCompleted: false,
    });
  }
}
