import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function fetchDoctors() {
  const supabase = await createClient();
  const { data: doctors } = await supabase
    .from("larinova_doctors")
    .select(
      "id, full_name, email, locale, created_at, onboarding_completed, invite_code_redeemed_at",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (!doctors || doctors.length === 0) return [];

  const ids = doctors.map((d) => d.id);

  const [subsRes, countsRes] = await Promise.all([
    supabase
      .from("larinova_subscriptions")
      .select("doctor_id, plan, status, current_period_end")
      .in("doctor_id", ids),
    supabase
      .from("larinova_consultations")
      .select("doctor_id")
      .in("doctor_id", ids),
  ]);

  const subMap = new Map((subsRes.data ?? []).map((s) => [s.doctor_id, s]));
  const countMap = new Map<string, number>();
  for (const c of countsRes.data ?? []) {
    countMap.set(c.doctor_id, (countMap.get(c.doctor_id) ?? 0) + 1);
  }

  return doctors.map((d) => ({
    ...d,
    subscription: subMap.get(d.id) ?? null,
    consultations: countMap.get(d.id) ?? 0,
  }));
}

export default async function DoctorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const doctors = await fetchDoctors();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Doctors</h1>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Locale</th>
              <th className="px-4 py-2 font-medium">Plan</th>
              <th className="px-4 py-2 font-medium">Onboarded</th>
              <th className="px-4 py-2 font-medium">Redeemed</th>
              <th className="px-4 py-2 font-medium">Consults</th>
              <th className="px-4 py-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((d) => (
              <tr
                key={d.id}
                className="border-t border-border hover:bg-muted/30"
              >
                <td className="px-4 py-2">
                  <Link
                    className="hover:underline"
                    href={`/${locale}/admin/doctors/${d.id}`}
                  >
                    {d.full_name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{d.email}</td>
                <td className="px-4 py-2 uppercase text-xs">{d.locale}</td>
                <td className="px-4 py-2">{d.subscription?.plan ?? "free"}</td>
                <td className="px-4 py-2">
                  {d.onboarding_completed ? "✓" : "—"}
                </td>
                <td className="px-4 py-2">
                  {d.invite_code_redeemed_at ? "✓" : "—"}
                </td>
                <td className="px-4 py-2 tabular-nums">{d.consultations}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {new Date(d.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {doctors.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No doctors yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
