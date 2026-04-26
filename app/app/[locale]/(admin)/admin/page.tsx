import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function fetchCounts() {
  const supabase = await createClient();
  const now = new Date();
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const safe = async <T,>(
    p: PromiseLike<{ count: number | null }>,
  ): Promise<number> => {
    try {
      const r = await p;
      return r.count ?? 0;
    } catch {
      return 0;
    }
  };

  const [
    doctors,
    doctorsLast7d,
    consultsThisMonth,
    activePro,
    openIssues,
    unredeemedCodes,
  ] = await Promise.all([
    safe(
      supabase
        .from("larinova_doctors")
        .select("id", { count: "exact", head: true }),
    ),
    safe(
      supabase
        .from("larinova_doctors")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo),
    ),
    safe(
      supabase
        .from("larinova_consultations")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfMonth),
    ),
    safe(
      supabase
        .from("larinova_subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("plan", "pro")
        .eq("status", "active")
        .gt("current_period_end", now.toISOString()),
    ),
    safe(
      supabase
        .from("larinova_issues")
        .select("id", { count: "exact", head: true })
        .eq("status", "open"),
    ),
    safe(
      supabase
        .from("larinova_invite_codes")
        .select("code", { count: "exact", head: true })
        .is("redeemed_by", null),
    ),
  ]);

  return {
    doctors,
    doctorsLast7d,
    consultsThisMonth,
    activePro,
    openIssues,
    unredeemedCodes,
  };
}

function Card({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="text-3xl font-semibold mt-2 tabular-nums">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

export default async function AdminOverview() {
  const c = await fetchCounts();
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card
          label="Total doctors"
          value={c.doctors}
          sub={`${c.doctorsLast7d} new in 7d`}
        />
        <Card label="Consults this month" value={c.consultsThisMonth} />
        <Card label="Active Pro" value={c.activePro} />
        <Card label="Open issues" value={c.openIssues} />
        <Card label="Unredeemed codes" value={c.unredeemedCodes} />
      </div>
    </div>
  );
}
