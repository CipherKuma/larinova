import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSubscription, getUsageCount } from "@/lib/subscription";
import { AIFeature, FREE_TIER_LIMITS } from "@/types/billing";

export async function GET() {
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
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const subscription = await getSubscription(doctor.id);

    const features: AIFeature[] = ["summary", "medical_codes", "helena_chat"];
    const usage: Record<string, { used: number; limit: number }> = {};

    for (const feature of features) {
      const used = await getUsageCount(doctor.id, feature);
      usage[feature] = {
        used,
        limit:
          subscription?.plan === "pro" ? Infinity : FREE_TIER_LIMITS[feature],
      };
    }

    return NextResponse.json({
      subscription: subscription ?? { plan: "free", status: "active" },
      usage,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch subscription status" },
      { status: 500 },
    );
  }
}
