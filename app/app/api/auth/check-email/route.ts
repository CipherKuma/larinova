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
        "id, user_id, onboarding_completed, invite_code_claimed_at, invite_code_redeemed_at",
      )
      .eq("email", normalizedEmail)
      .maybeSingle();
    let hasAlphaDoctorAccess = Boolean(
      doctor?.invite_code_claimed_at || doctor?.invite_code_redeemed_at,
    );

    const { data: pendingInvite } = await supabase
      .from("larinova_invite_codes")
      .select("code")
      .eq("email", normalizedEmail)
      .is("claimed_at", null)
      .is("redeemed_at", null)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Repair the only half-created state: auth user + doctor row exists, but
    // the invite row was not marked claimed. This can happen if OTP verification
    // signs the user out before /api/invite/claim runs. Since OTP delivery still
    // proves ownership of the invited email, binding the exact pending invite
    // here is safe and keeps the sign-in gate from showing "pending" forever.
    if (doctor && !hasAlphaDoctorAccess && pendingInvite) {
      const claimedAt = new Date().toISOString();
      await supabase
        .from("larinova_invite_codes")
        .update({
          claimed_at: claimedAt,
          claimed_by_user_id: doctor.user_id,
          redeemed_at: claimedAt,
          redeemed_by: doctor.user_id,
        })
        .eq("code", pendingInvite.code)
        .is("consumed_at", null);
      await supabase
        .from("larinova_doctors")
        .update({ invite_code_claimed_at: claimedAt })
        .eq("id", doctor.id);
      await supabase
        .from("larinova_subscriptions")
        .update({
          plan: "pro",
          status: "active",
          current_period_end: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          updated_at: claimedAt,
        })
        .eq("doctor_id", doctor.id)
        .eq("plan", "free");
      hasAlphaDoctorAccess = true;
    }

    return NextResponse.json({
      exists: hasAlphaDoctorAccess,
      hasDoctorProfile: !!doctor,
      hasPendingInvite: !doctor && !!pendingInvite,
      isAdmin: isAdminEmail(normalizedEmail),
      onboardingCompleted: doctor?.onboarding_completed ?? false,
    });
  } catch {
    return NextResponse.json({
      exists: false,
      hasPendingInvite: false,
      isAdmin: false,
      onboardingCompleted: false,
    });
  }
}
