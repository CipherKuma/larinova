import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { razorpay } from "@/lib/razorpay";
import { BillingInterval } from "@/types/billing";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: doctor } = await supabase
      .from("larinova_doctors")
      .select("id, full_name")
      .eq("user_id", user.id)
      .single();

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const { interval, region } = (await req.json()) as {
      interval: BillingInterval;
      region?: string;
    };

    if (!interval || !["month", "year"].includes(interval)) {
      return NextResponse.json(
        { error: "Invalid billing interval" },
        { status: 400 },
      );
    }

    const isIndia = region === "IN";

    const planId = isIndia
      ? interval === "month"
        ? process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID_INR!
        : process.env.RAZORPAY_PRO_YEARLY_PLAN_ID_INR!
      : interval === "month"
        ? process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID!
        : process.env.RAZORPAY_PRO_YEARLY_PLAN_ID!;

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: interval === "month" ? 12 : 1,
      quantity: 1,
      notes: {
        doctor_id: doctor.id,
        user_id: user.id,
        doctor_name: doctor.full_name,
      },
    });

    // Store the razorpay subscription id temporarily
    await supabase
      .from("larinova_subscriptions")
      .update({
        razorpay_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      })
      .eq("doctor_id", doctor.id);

    return NextResponse.json({
      subscription_id: subscription.id,
      key_id: process.env.RAZORPAY_KEY_ID,
      doctor_name: doctor.full_name,
      email: user.email,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 },
    );
  }
}
