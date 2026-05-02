import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RedeemForm } from "./RedeemForm";

export const dynamic = "force-dynamic";

type Params = { locale: string };

export default async function RedeemPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  const { data: doctor } = await supabase
    .from("larinova_doctors")
    .select("invite_code_redeemed_at, onboarding_completed")
    .eq("user_id", user.id)
    .single();

  if (doctor?.invite_code_redeemed_at) {
    redirect(
      doctor.onboarding_completed ? `/${locale}` : `/${locale}/onboarding`,
    );
  }

  return (
    <main className="min-h-dvh flex items-center justify-center bg-background p-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-md">
        <RedeemForm locale={locale} />
      </div>
    </main>
  );
}
