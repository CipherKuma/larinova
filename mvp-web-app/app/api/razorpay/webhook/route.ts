import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  const supabase = await createClient();

  try {
    switch (event.event) {
      case "subscription.activated": {
        const sub = event.payload.subscription.entity;
        await supabase
          .from("larinova_subscriptions")
          .update({
            plan: "pro",
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("razorpay_subscription_id", sub.id);
        break;
      }

      case "subscription.charged": {
        const sub = event.payload.subscription.entity;
        const currentEnd = sub.current_end
          ? new Date(sub.current_end * 1000).toISOString()
          : null;

        await supabase
          .from("larinova_subscriptions")
          .update({
            status: "active",
            current_period_end: currentEnd,
            updated_at: new Date().toISOString(),
          })
          .eq("razorpay_subscription_id", sub.id);
        break;
      }

      case "subscription.halted":
      case "subscription.pending": {
        const sub = event.payload.subscription.entity;
        await supabase
          .from("larinova_subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("razorpay_subscription_id", sub.id);
        break;
      }

      case "subscription.cancelled":
      case "subscription.completed": {
        const sub = event.payload.subscription.entity;
        await supabase
          .from("larinova_subscriptions")
          .update({
            plan: "free",
            status: "canceled",
            razorpay_subscription_id: null,
            billing_interval: null,
            current_period_end: null,
            updated_at: new Date().toISOString(),
          })
          .eq("razorpay_subscription_id", sub.id);
        break;
      }
    }
  } catch {
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
