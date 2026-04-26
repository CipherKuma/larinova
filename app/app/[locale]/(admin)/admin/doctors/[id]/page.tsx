import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DoctorDetail({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: doctor } = await supabase
    .from("larinova_doctors")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!doctor) notFound();

  const [subRes, consultsRes] = await Promise.all([
    supabase
      .from("larinova_subscriptions")
      .select("plan, status, current_period_end, billing_interval")
      .eq("doctor_id", id)
      .maybeSingle(),
    supabase
      .from("larinova_consultations")
      .select("id, created_at, status")
      .eq("doctor_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{doctor.full_name}</h1>
        <p className="text-sm text-muted-foreground">{doctor.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Locale" value={doctor.locale} />
        <Field
          label="Joined"
          value={new Date(doctor.created_at).toLocaleString()}
        />
        <Field
          label="Onboarding"
          value={doctor.onboarding_completed ? "Completed" : "Not completed"}
        />
        <Field
          label="Invite redeemed"
          value={
            doctor.invite_code_redeemed_at
              ? new Date(doctor.invite_code_redeemed_at).toLocaleString()
              : "—"
          }
        />
        <Field label="Plan" value={subRes.data?.plan ?? "free"} />
        <Field
          label="Period end"
          value={
            subRes.data?.current_period_end
              ? new Date(subRes.data.current_period_end).toLocaleString()
              : "—"
          }
        />
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">Recent consultations</h2>
        <ul className="rounded-lg border border-border bg-card">
          {(consultsRes.data ?? []).map((c) => (
            <li
              key={c.id}
              className="px-4 py-2 border-b border-border last:border-0 flex justify-between text-sm"
            >
              <span className="font-mono text-xs">{c.id}</span>
              <span className="text-muted-foreground">
                {new Date(c.created_at).toLocaleString()}
              </span>
            </li>
          ))}
          {(consultsRes.data ?? []).length === 0 && (
            <li className="px-4 py-6 text-center text-muted-foreground text-sm">
              No consultations yet.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="text-sm mt-1">{value ?? "—"}</div>
    </div>
  );
}
