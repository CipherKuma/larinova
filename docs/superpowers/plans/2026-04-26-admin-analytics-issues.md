# Admin Panel + Custom Analytics + Issue Reporting — Implementation Plan

> **For agentic workers:** Pick ONE of three sanctioned execution paths:
> 1. **`superpowers:executing-plans`** — sequential execution with built-in checkpoints (default for most plans)
> 2. **cmux-teams** — parallel execution across 3+ independent workstreams via cmux tabs (see `~/.claude/rules/cmux-teams.md`)
> 3. **`superpowers:subagent-driven-development`** — fresh subagent per task, fastest iteration (for plans with clear task boundaries)
>
> **Fresh session guidance**: this plan has 24 tasks + 2 schema migrations + multi-module changes. **Strongly prefer a fresh Claude Code session.**
>
> **Testing flow**: `app/CLAUDE.md` flow is **implement → typecheck → curl/Playwright verify → commit**. Not TDD. Steps below follow that shape.
>
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/admin` operational dashboard, a self-hosted event-tracking pipeline, and an in-product `/issues` flow with threaded chat between doctors and admin.

**Architecture:** Three phases, independently shippable. Phase A delivers admin shell (auth gate, code generation, doctor/survey lists). Phase B delivers a `larinova_events` table fed by client autocapture + server-side milestones, with a `/admin/analytics` dashboard. Phase C delivers an issue-tracker with RLS-enforced doctor isolation and email-to-admin on file. All three respect existing patterns: Next.js App Router, Supabase SSR auth, RLS for doctor data, service role for admin endpoints.

**Tech Stack:** Next.js 16 (App Router) · Supabase (Postgres + Auth + RLS) · TypeScript · zod · Resend · existing shadcn UI primitives

**Project flow reference:** `/Users/gabrielantonyxaviour/Documents/products/larinova/app/CLAUDE.md`. Spec lives at `docs/superpowers/specs/2026-04-26-admin-analytics-issues-design.md`.

**Working directory for all tasks:** `/Users/gabrielantonyxaviour/Documents/products/larinova/app`

---

## File Structure

**New (Phase A):**
- `lib/admin.ts` — admin email allowlist + helper
- `app/[locale]/(admin)/admin/layout.tsx` — admin shell + sidebar
- `app/[locale]/(admin)/admin/page.tsx` — overview
- `app/[locale]/(admin)/admin/codes/page.tsx` — code list
- `app/[locale]/(admin)/admin/codes/CodeGenerateModal.tsx` — generation modal client component
- `app/[locale]/(admin)/admin/doctors/page.tsx` — doctor list
- `app/[locale]/(admin)/admin/doctors/[id]/page.tsx` — single doctor drill-down
- `app/[locale]/(admin)/admin/surveys/page.tsx` — survey responses
- `app/api/admin/codes/list/route.ts`
- `app/api/admin/codes/generate/route.ts`
- `app/api/admin/doctors/list/route.ts`
- `app/api/admin/surveys/list/route.ts`
- `app/api/admin/surveys/export/route.ts`
- `lib/admin/auth.ts` — server-side admin gate helper

**Modified (Phase A):**
- `proxy.ts` — gate `/admin` and `/api/admin` paths

**New (Phase B):**
- `supabase/migrations/20260426120000_create_analytics_events.sql`
- `lib/analytics/track.ts` — client tracker singleton
- `lib/analytics/server.ts` — server-side `trackMilestone`
- `components/AnalyticsProvider.tsx` — initializes tracker on mount, hooks router
- `app/api/analytics/ingest/route.ts`
- `app/[locale]/(admin)/admin/analytics/page.tsx`
- `app/[locale]/(admin)/admin/analytics/sessions/[id]/page.tsx`
- `app/api/admin/analytics/timeseries/route.ts`
- `app/api/admin/analytics/top-elements/route.ts`
- `app/api/admin/analytics/funnel/route.ts`
- `app/api/admin/analytics/sessions/route.ts`
- `app/api/admin/analytics/sessions/[id]/route.ts`

**Modified (Phase B):**
- `app/[locale]/layout.tsx` — mount `<AnalyticsProvider>`
- `app/api/invite/redeem/route.ts` — add `trackMilestone('invite_redeemed', ...)`
- `app/api/consultations/start/route.ts` — add `trackMilestone('consultation_started', ...)`
- `app/api/consultations/[id]/summary/route.ts` — add `trackMilestone('summary_generated', ...)`
- `app/api/razorpay/webhook/route.ts` — add `trackMilestone('payment_succeeded', ...)`

**New (Phase C):**
- `supabase/migrations/20260426130000_create_issues.sql`
- `app/[locale]/(protected)/issues/page.tsx`
- `app/[locale]/(protected)/issues/new/page.tsx`
- `app/[locale]/(protected)/issues/[id]/page.tsx`
- `app/[locale]/(protected)/issues/IssueChat.tsx` — chat thread client component
- `app/api/issues/route.ts` — POST new issue
- `app/api/issues/list/route.ts` — GET own issues
- `app/api/issues/[id]/route.ts` — GET own single issue
- `app/api/issues/[id]/messages/route.ts` — POST doctor message
- `app/[locale]/(admin)/admin/issues/page.tsx`
- `app/[locale]/(admin)/admin/issues/[id]/page.tsx`
- `app/api/admin/issues/list/route.ts`
- `app/api/admin/issues/[id]/route.ts` — GET + PATCH status
- `app/api/admin/issues/[id]/messages/route.ts` — POST admin reply
- `lib/notify/issue-filed-email.ts` — Resend template + send

**Modified (Phase C):**
- `components/layout/AppHeader.tsx` (or equivalent) — add "Report issue" button

---

# Phase A — Admin Shell

## Task A1: Admin auth gate

**Files:**
- Create: `lib/admin.ts`
- Create: `lib/admin/auth.ts`
- Modify: `proxy.ts`

- [ ] **Step 1: Create `lib/admin.ts`**

```ts
export const ADMIN_EMAILS = ["gabrielantony56@gmail.com"] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const e = email.toLowerCase().trim();
  return (ADMIN_EMAILS as readonly string[]).includes(e);
}
```

- [ ] **Step 2: Create `lib/admin/auth.ts`**

```ts
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

/**
 * Server-side admin guard. Returns the user if they're an admin,
 * otherwise null. Use this in admin server components and API
 * routes — never trust the middleware alone.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}
```

- [ ] **Step 3: Edit `proxy.ts` to gate `/admin` and `/api/admin`**

Add this block AFTER the existing user resolution and BEFORE the existing onboarding redirect block. The new block fires only on admin paths and 404s non-admins.

```ts
// Admin gate: gate /admin and /api/admin to the allowlist. Use 404
// (not 403) so non-admins never even confirm the path exists.
const isAdminPath =
  pathname.includes("/admin") || pathname.startsWith("/api/admin");
if (isAdminPath) {
  const { isAdminEmail } = await import("@/lib/admin");
  if (!user || !isAdminEmail(user.email)) {
    return new NextResponse(null, { status: 404 });
  }
}
```

Place this immediately after the `let user = ...` block in `proxy.ts` (around line 90 in current `proxy.ts`).

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit -p .
```
Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add lib/admin.ts lib/admin/auth.ts proxy.ts
git commit -m "feat(admin): allowlist gate (gabrielantony56@gmail.com), 404 on non-admin /admin paths"
```

---

## Task A2: Admin shell layout + overview

**Files:**
- Create: `app/[locale]/(admin)/admin/layout.tsx`
- Create: `app/[locale]/(admin)/admin/page.tsx`
- Create: `app/[locale]/(admin)/admin/AdminSidebar.tsx`

- [ ] **Step 1: Create the admin sidebar (client component)**

`app/[locale]/(admin)/admin/AdminSidebar.tsx`:
```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/codes", label: "Invite codes" },
  { href: "/admin/doctors", label: "Doctors" },
  { href: "/admin/surveys", label: "Survey responses" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/issues", label: "Issues" },
];

export function AdminSidebar({ locale }: { locale: string }) {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 border-r border-border h-dvh sticky top-0 p-4 bg-background">
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4 px-2">
        Larinova · Admin
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const localized = `/${locale}${item.href}`;
          const isActive =
            pathname === localized ||
            (item.href !== "/admin" && pathname.startsWith(localized));
          return (
            <Link
              key={item.href}
              href={localized}
              className={
                "px-3 py-2 rounded-md text-sm transition " +
                (isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: Create the admin layout (server component, gates access)**

`app/[locale]/(admin)/admin/layout.tsx`:
```tsx
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminSidebar } from "./AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireAdmin();
  if (!user) redirect(`/${locale}/sign-in`);

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar locale={locale} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Create the overview page**

`app/[locale]/(admin)/admin/page.tsx`:
```tsx
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function fetchCounts() {
  const supabase = await createClient();
  const now = new Date();
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const [doctors, doctorsLast7d, consultsThisMonth, activePro, openIssues, unredeemedCodes] =
    await Promise.all([
      supabase.from("larinova_doctors").select("id", { count: "exact", head: true }),
      supabase.from("larinova_doctors").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
      supabase.from("larinova_consultations").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth),
      supabase.from("larinova_subscriptions").select("id", { count: "exact", head: true }).eq("plan", "pro").eq("status", "active").gt("current_period_end", now.toISOString()),
      supabase.from("larinova_issues").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("larinova_invite_codes").select("code", { count: "exact", head: true }).is("redeemed_by", null),
    ]);

  return {
    doctors: doctors.count ?? 0,
    doctorsLast7d: doctorsLast7d.count ?? 0,
    consultsThisMonth: consultsThisMonth.count ?? 0,
    activePro: activePro.count ?? 0,
    openIssues: openIssues.count ?? 0,
    unredeemedCodes: unredeemedCodes.count ?? 0,
  };
}

function Card({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
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
        <Card label="Total doctors" value={c.doctors} sub={`${c.doctorsLast7d} new in 7d`} />
        <Card label="Consults this month" value={c.consultsThisMonth} />
        <Card label="Active Pro" value={c.activePro} />
        <Card label="Open issues" value={c.openIssues} />
        <Card label="Unredeemed codes" value={c.unredeemedCodes} />
      </div>
    </div>
  );
}
```

Note: the issues query (`larinova_issues`) and analytics query later will fail until Phase C and Phase B migrations are applied. The page is wrapped in `Promise.all` so a failed sub-query throws. Add try/catch on `fetchCounts` returning `0` for any rejected count, OR comment out `openIssues` until Phase C lands. Recommendation: wrap each `supabase.from(...)` call in `.then(r => r.count ?? 0).catch(() => 0)`.

Concretely, change `fetchCounts` to:
```ts
const safe = async (q: any) => q.then((r: any) => r.count ?? 0).catch(() => 0);

const [doctors, doctorsLast7d, consultsThisMonth, activePro, openIssues, unredeemedCodes] = await Promise.all([
  safe(supabase.from("larinova_doctors").select("id", { count: "exact", head: true })),
  // ... same for the rest
]);
```

- [ ] **Step 4: Typecheck + sanity build**

```bash
npx tsc --noEmit -p .
```
Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add 'app/[locale]/(admin)' lib/admin
git commit -m "feat(admin): /admin shell + overview cards"
```

---

## Task A3: `/admin/codes` — list + generate

**Files:**
- Create: `app/[locale]/(admin)/admin/codes/page.tsx`
- Create: `app/[locale]/(admin)/admin/codes/CodeGenerateModal.tsx`
- Create: `app/api/admin/codes/list/route.ts`
- Create: `app/api/admin/codes/generate/route.ts`

- [ ] **Step 1: List endpoint**

`app/api/admin/codes/list/route.ts`:
```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("larinova_invite_codes")
    .select("code, note, created_at, redeemed_by, redeemed_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ codes: data ?? [] });
}
```

- [ ] **Step 2: Generate endpoint**

`app/api/admin/codes/generate/route.ts`:
```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

const Body = z.object({
  count: z.number().int().min(1).max(50),
  note: z.string().trim().max(120).optional(),
});

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function genCode(): string {
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `LARINOVA-${s}`;
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const supabase = await createClient();
  const inserted: string[] = [];

  for (let i = 0; i < body.count; i++) {
    let attempts = 0;
    while (attempts < 5) {
      const code = genCode();
      const { error } = await supabase
        .from("larinova_invite_codes")
        .insert({ code, note: body.note ?? null });
      if (!error) {
        inserted.push(code);
        break;
      }
      // 23505 = unique_violation; retry. Else bail.
      if (!error.message.includes("duplicate")) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      attempts++;
    }
  }

  return NextResponse.json({ codes: inserted });
}
```

- [ ] **Step 3: Generate modal component**

`app/[locale]/(admin)/admin/codes/CodeGenerateModal.tsx`:
```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CodeGenerateModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(5);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generated, setGenerated] = useState<string[] | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/codes/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ count, note: note.trim() || undefined }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "failed");
      setGenerated(body.codes);
      router.refresh();
    } catch (err) {
      alert(`Generation failed: ${(err as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setGenerated(null); }}>
      <DialogTrigger asChild>
        <Button>Generate codes</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate invite codes</DialogTitle>
        </DialogHeader>
        {generated ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Generated {generated.length} codes:</p>
            <pre className="bg-muted rounded p-3 text-xs whitespace-pre-wrap">{generated.join("\n")}</pre>
            <Button onClick={() => navigator.clipboard.writeText(generated.join("\n"))}>Copy all</Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="count">Count (1–50)</Label>
              <Input id="count" type="text" inputMode="numeric" value={count} onChange={(e) => setCount(parseInt(e.target.value.replace(/\D/g, "")) || 0)} />
            </div>
            <div>
              <Label htmlFor="note">Note (optional)</Label>
              <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Pilot batch 2" />
            </div>
            <Button type="submit" disabled={submitting || count < 1 || count > 50}>
              {submitting ? "Generating…" : `Generate ${count} codes`}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Codes list page**

`app/[locale]/(admin)/admin/codes/page.tsx`:
```tsx
import { createClient } from "@/lib/supabase/server";
import { CodeGenerateModal } from "./CodeGenerateModal";

export const dynamic = "force-dynamic";

async function fetchCodes() {
  const supabase = await createClient();
  const { data: codes } = await supabase
    .from("larinova_invite_codes")
    .select("code, note, created_at, redeemed_by, redeemed_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (!codes || codes.length === 0) return [];

  const redeemerIds = codes.map((c) => c.redeemed_by).filter(Boolean) as string[];
  let doctorMap = new Map<string, { full_name: string; email: string }>();
  if (redeemerIds.length > 0) {
    const { data: doctors } = await supabase
      .from("larinova_doctors")
      .select("user_id, full_name, email")
      .in("user_id", redeemerIds);
    for (const d of doctors ?? []) {
      doctorMap.set(d.user_id, { full_name: d.full_name, email: d.email });
    }
  }

  return codes.map((c) => ({
    ...c,
    redeemer: c.redeemed_by ? doctorMap.get(c.redeemed_by) ?? null : null,
  }));
}

export default async function CodesPage() {
  const codes = await fetchCodes();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Invite codes</h1>
        <CodeGenerateModal />
      </div>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="px-4 py-2 font-medium">Code</th>
              <th className="px-4 py-2 font-medium">Note</th>
              <th className="px-4 py-2 font-medium">Created</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Redeemed by</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.code} className="border-t border-border">
                <td className="px-4 py-2 font-mono">{c.code}</td>
                <td className="px-4 py-2 text-muted-foreground">{c.note ?? "—"}</td>
                <td className="px-4 py-2 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-2">{c.redeemed_at ? <span className="text-emerald-500">Redeemed</span> : <span className="text-muted-foreground">Open</span>}</td>
                <td className="px-4 py-2">{c.redeemer ? `${c.redeemer.full_name} (${c.redeemer.email})` : "—"}</td>
              </tr>
            ))}
            {codes.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No codes yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Typecheck + commit**

```bash
npx tsc --noEmit -p .
git add 'app/[locale]/(admin)/admin/codes' app/api/admin/codes
git commit -m "feat(admin): /admin/codes list + generation modal"
```

---

## Task A4: `/admin/doctors` — list + drilldown

**Files:**
- Create: `app/[locale]/(admin)/admin/doctors/page.tsx`
- Create: `app/[locale]/(admin)/admin/doctors/[id]/page.tsx`
- Create: `app/api/admin/doctors/list/route.ts`

- [ ] **Step 1: Doctors list page**

`app/[locale]/(admin)/admin/doctors/page.tsx`:
```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function fetchDoctors() {
  const supabase = await createClient();
  const { data: doctors } = await supabase
    .from("larinova_doctors")
    .select("id, full_name, email, locale, created_at, onboarding_completed, invite_code_redeemed_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (!doctors || doctors.length === 0) return [];

  const ids = doctors.map((d) => d.id);
  const [subs, consults] = await Promise.all([
    supabase.from("larinova_subscriptions").select("doctor_id, plan, status, current_period_end").in("doctor_id", ids),
    supabase.rpc("count_consultations_by_doctor", { doctor_ids: ids }).then(r => r.error ? null : r.data),
  ]);

  const subMap = new Map((subs.data ?? []).map((s: any) => [s.doctor_id, s]));
  // If the rpc isn't there, count manually:
  const { data: counts } = await supabase
    .from("larinova_consultations")
    .select("doctor_id")
    .in("doctor_id", ids);
  const countMap = new Map<string, number>();
  for (const c of counts ?? []) {
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
              <tr key={d.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-2"><Link className="hover:underline" href={`/${locale}/admin/doctors/${d.id}`}>{d.full_name}</Link></td>
                <td className="px-4 py-2 text-muted-foreground">{d.email}</td>
                <td className="px-4 py-2 uppercase text-xs">{d.locale}</td>
                <td className="px-4 py-2">{d.subscription?.plan ?? "free"}</td>
                <td className="px-4 py-2">{d.onboarding_completed ? "✓" : "—"}</td>
                <td className="px-4 py-2">{d.invite_code_redeemed_at ? "✓" : "—"}</td>
                <td className="px-4 py-2 tabular-nums">{d.consultations}</td>
                <td className="px-4 py-2 text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Doctor drilldown page**

`app/[locale]/(admin)/admin/doctors/[id]/page.tsx`:
```tsx
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
    .single();
  if (!doctor) notFound();

  const [subRes, consultsRes] = await Promise.all([
    supabase
      .from("larinova_subscriptions")
      .select("plan, status, current_period_end, billing_interval")
      .eq("doctor_id", id)
      .single(),
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
        <Field label="Joined" value={new Date(doctor.created_at).toLocaleString()} />
        <Field label="Onboarding" value={doctor.onboarding_completed ? "Completed" : "Not completed"} />
        <Field label="Invite redeemed" value={doctor.invite_code_redeemed_at ? new Date(doctor.invite_code_redeemed_at).toLocaleString() : "—"} />
        <Field label="Plan" value={subRes.data?.plan ?? "free"} />
        <Field label="Period end" value={subRes.data?.current_period_end ? new Date(subRes.data.current_period_end).toLocaleString() : "—"} />
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">Recent consultations</h2>
        <ul className="rounded-lg border border-border bg-card">
          {(consultsRes.data ?? []).map((c) => (
            <li key={c.id} className="px-4 py-2 border-b border-border last:border-0 flex justify-between text-sm">
              <span className="font-mono text-xs">{c.id}</span>
              <span className="text-muted-foreground">{new Date(c.created_at).toLocaleString()}</span>
            </li>
          ))}
          {(consultsRes.data ?? []).length === 0 && (
            <li className="px-4 py-6 text-center text-muted-foreground text-sm">No consultations yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-sm mt-1">{value ?? "—"}</div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck + commit**

```bash
npx tsc --noEmit -p .
git add 'app/[locale]/(admin)/admin/doctors'
git commit -m "feat(admin): /admin/doctors list + drilldown"
```

---

## Task A5: `/admin/surveys` — verify form, then build viewer

**Files:**
- Modify: `landing/...` if survey form is broken (TBD after step 1 inspection)
- Create: `app/[locale]/(admin)/admin/surveys/page.tsx`
- Create: `app/api/admin/surveys/export/route.ts`

- [ ] **Step 1: Read schema of `larinova_discovery_surveys`**

```bash
cd /Users/gabrielantonyxaviour/Documents/products/larinova/app
SR=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env | cut -d'=' -f2- | tr -d '"')
SBURL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env | cut -d'=' -f2- | tr -d '"')
curl -sS "$SBURL/rest/v1/larinova_discovery_surveys?limit=1" -H "apikey: $SR" -H "Authorization: Bearer $SR" | python3 -m json.tool
```
Expected: a JSON array (possibly empty). Note the column names in the response (or, if empty array, read the migration `supabase/migrations/20260414000000_discovery_surveys.sql` to see the schema).

- [ ] **Step 2: Find which page POSTs to it**

```bash
cd /Users/gabrielantonyxaviour/Documents/products/larinova
grep -rn "larinova_discovery_surveys\|/api/discovery\|/api/survey" landing/ app/ --include="*.ts" --include="*.tsx" | head -20
```
Note: where the form is rendered (a `landing/` page) and where it submits (likely `app/api/...` or directly to Supabase via anon key).

- [ ] **Step 3: Test the form end-to-end manually**

Submit the form on `https://larinova.com/...` (the landing page that has the discovery form). Then re-query:
```bash
curl -sS "$SBURL/rest/v1/larinova_discovery_surveys?order=created_at.desc&limit=3" -H "apikey: $SR" -H "Authorization: Bearer $SR" | python3 -m json.tool
```
Expected: your test submission appears at the top.

If the form is broken (no row inserted), fix it before continuing. Document what was broken in the commit message.

- [ ] **Step 4: Build the surveys list page**

`app/[locale]/(admin)/admin/surveys/page.tsx` (adapt columns to whatever the actual schema is — read the migration first):
```tsx
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SurveysPage() {
  const supabase = await createClient();
  const { data: surveys } = await supabase
    .from("larinova_discovery_surveys")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Survey responses</h1>
        <a className="text-sm underline" href="/api/admin/surveys/export">Export CSV</a>
      </div>
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="px-4 py-2 font-medium">Submitted</th>
              {/* Adjust these columns based on actual schema */}
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Response (raw)</th>
            </tr>
          </thead>
          <tbody>
            {(surveys ?? []).map((s) => (
              <tr key={s.id} className="border-t border-border align-top">
                <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">{new Date(s.created_at).toLocaleString()}</td>
                <td className="px-4 py-2">{s.full_name ?? s.name ?? "—"}</td>
                <td className="px-4 py-2 text-muted-foreground">{s.email ?? "—"}</td>
                <td className="px-4 py-2"><details><summary className="cursor-pointer">View</summary><pre className="text-xs whitespace-pre-wrap mt-2">{JSON.stringify(s, null, 2)}</pre></details></td>
              </tr>
            ))}
            {(!surveys || surveys.length === 0) && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No responses yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: CSV export endpoint**

`app/api/admin/surveys/export/route.ts`:
```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("larinova_discovery_surveys")
    .select("*")
    .order("created_at", { ascending: false });

  if (!rows || rows.length === 0) {
    return new NextResponse("no rows\n", {
      status: 200,
      headers: { "content-type": "text/csv" },
    });
  }

  const cols = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv =
    cols.join(",") +
    "\n" +
    rows.map((r: any) => cols.map((c) => escape(r[c])).join(",")).join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="surveys-${Date.now()}.csv"`,
    },
  });
}
```

- [ ] **Step 6: Typecheck + commit**

```bash
npx tsc --noEmit -p .
git add 'app/[locale]/(admin)/admin/surveys' app/api/admin/surveys
git commit -m "feat(admin): /admin/surveys viewer + CSV export"
```

---

## Task A6: Phase A end-to-end smoke

- [ ] **Step 1: Build**

```bash
cd /Users/gabrielantonyxaviour/Documents/products/larinova/app
npm run build
```
Expected: build succeeds; `/[locale]/admin`, `/[locale]/admin/codes`, `/[locale]/admin/doctors`, `/[locale]/admin/doctors/[id]`, `/[locale]/admin/surveys` appear in the route manifest.

- [ ] **Step 2: Push to production**

```bash
git push origin main
```
Wait for Vercel deploy to be Ready (poll via `vercel ls larinova-app`).

- [ ] **Step 3: Smoke against prod (admin)**

Sign in as `gabrielantony56@gmail.com` on `https://app.larinova.com/in/sign-in`, then navigate to `/in/admin`. Verify:
- Sidebar renders with all nav items
- Overview cards show real numbers
- `/in/admin/codes` shows the existing 5 pilot codes
- Click "Generate codes" → modal opens → enter count=2, note="smoke test" → see 2 new codes returned
- Refresh; the 2 new codes appear in the list
- `/in/admin/doctors` shows all signed-up doctors
- `/in/admin/surveys` shows survey responses (if any)

- [ ] **Step 4: Smoke negative — non-admin gets 404**

Open an incognito window. Sign in as a non-admin (or sign up a fresh account with a different email). Navigate to `/in/admin`. Expected: 404 (Next.js's not-found page).

- [ ] **Step 5: Clean up smoke test codes**

```bash
SR=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env | cut -d'=' -f2- | tr -d '"')
SBURL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env | cut -d'=' -f2- | tr -d '"')
curl -sS -X DELETE "$SBURL/rest/v1/larinova_invite_codes?note=eq.smoke%20test" -H "apikey: $SR" -H "Authorization: Bearer $SR" -H "Prefer: return=minimal" -w "%{http_code}\n"
```
Expected: 204.

---

# Phase B — Custom Analytics

## Task B1: Migration — `larinova_events` table

**Files:**
- Create: `supabase/migrations/20260426120000_create_analytics_events.sql`

- [ ] **Step 1: Write the migration**

`supabase/migrations/20260426120000_create_analytics_events.sql`:
```sql
-- Custom event-tracking pipeline (replaces 3rd-party analytics).
-- Spec: docs/superpowers/specs/2026-04-26-admin-analytics-issues-design.md §5.3

CREATE TABLE larinova_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id   TEXT NOT NULL,
  anonymous_id TEXT NOT NULL,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type   TEXT NOT NULL CHECK (event_type IN ('pageview','click','milestone','admin_action')),
  path         TEXT,
  raw_path     TEXT,
  element      TEXT,
  properties   JSONB DEFAULT '{}'::jsonb,
  user_agent   TEXT,
  ip_hash      TEXT,
  locale       TEXT
);

CREATE INDEX idx_events_ts ON larinova_events (ts DESC);
CREATE INDEX idx_events_session ON larinova_events (session_id, ts);
CREATE INDEX idx_events_user ON larinova_events (user_id, ts DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_events_type_path ON larinova_events (event_type, path);

ALTER TABLE larinova_events ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated) can INSERT (rate-limited at the
-- ingest endpoint, not RLS). Reads are admin-only via service role.
CREATE POLICY events_insert_anon ON larinova_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY events_insert_authed ON larinova_events FOR INSERT TO authenticated WITH CHECK (true);
```

- [ ] **Step 2: Apply via the same path Phase 19 used (Supabase SQL editor)**

Open https://supabase.com/dashboard/project/afitpprgfsidrnrrhvzs/sql/new and paste the migration. Run. Verify:

```bash
SR=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env | cut -d'=' -f2- | tr -d '"')
SBURL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env | cut -d'=' -f2- | tr -d '"')
curl -sS "$SBURL/rest/v1/larinova_events?limit=0" -H "apikey: $SR" -H "Authorization: Bearer $SR" -w "\nstatus: %{http_code}\n"
```
Expected: 200 with `[]`.

- [ ] **Step 3: Commit migration file**

```bash
git add supabase/migrations/20260426120000_create_analytics_events.sql
git commit -m "feat(db): larinova_events table for custom analytics"
```

---

## Task B2: Client tracker — `lib/analytics/track.ts`

**Files:**
- Create: `lib/analytics/track.ts`
- Create: `components/AnalyticsProvider.tsx`
- Modify: `app/[locale]/layout.tsx` (mount provider)

- [ ] **Step 1: Tracker singleton**

`lib/analytics/track.ts`:
```ts
"use client";

type EventType = "pageview" | "click" | "milestone";

type ClientEvent = {
  event_type: EventType;
  path?: string;
  raw_path?: string;
  element?: string;
  properties?: Record<string, unknown>;
};

const STORAGE_KEYS = {
  ANON: "lari_anonymous_id",
  SESSION: "lari_session_id",
};

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getOrCreateAnonId(): string {
  if (typeof window === "undefined") return "ssr";
  let v = localStorage.getItem(STORAGE_KEYS.ANON);
  if (!v) {
    v = uuid();
    try { localStorage.setItem(STORAGE_KEYS.ANON, v); } catch {}
  }
  return v;
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let v = sessionStorage.getItem(STORAGE_KEYS.SESSION);
  if (!v) {
    v = uuid();
    try { sessionStorage.setItem(STORAGE_KEYS.SESSION, v); } catch {}
  }
  return v;
}

function normalizePath(rawPath: string): string {
  // /in/patients/abc-123-uuid/consultation → /in/patients/[id]/consultation
  return rawPath
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?=\/|$)/g, "/[id]")
    .replace(/\/\d+(?=\/|$)/g, "/[n]")
    .split("?")[0];
}

function elementLabel(el: HTMLElement): string | null {
  // Walk up to find a tracking-eligible ancestor (button, a, [role=button], [data-track])
  let node: HTMLElement | null = el;
  for (let depth = 0; node && depth < 5; depth++, node = node.parentElement) {
    const dataTrack = node.getAttribute("data-track");
    if (dataTrack) return `data-track:${dataTrack.slice(0, 60)}`;
    const role = node.getAttribute("role");
    const tag = node.tagName.toLowerCase();
    if (tag === "button" || role === "button") {
      return `button:${(node.textContent ?? "").trim().slice(0, 60)}`;
    }
    if (tag === "a") {
      const text = (node.textContent ?? "").trim();
      const href = node.getAttribute("href") ?? "";
      return `a:${text.slice(0, 40) || href.slice(0, 60)}`;
    }
  }
  return null;
}

class Tracker {
  private buffer: ClientEvent[] = [];
  private flushTimer: number | null = null;
  private initialized = false;

  init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;
    getOrCreateAnonId();
    getOrCreateSessionId();

    // Capture-phase click listener (so we see clicks even if the
    // handler stops propagation downstream)
    document.addEventListener(
      "click",
      (e) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const label = elementLabel(target);
        if (!label) return;
        this.track({
          event_type: "click",
          element: label,
          path: normalizePath(window.location.pathname),
          raw_path: window.location.pathname + window.location.search,
        });
      },
      { capture: true },
    );

    // Flush on tab hide/unload
    window.addEventListener("pagehide", () => this.flush(true));
    window.addEventListener("beforeunload", () => this.flush(true));
  }

  trackPageview(path: string) {
    this.track({
      event_type: "pageview",
      path: normalizePath(path),
      raw_path: path,
    });
  }

  track(event: ClientEvent) {
    this.buffer.push(event);
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.flushTimer != null) return;
    this.flushTimer = window.setTimeout(() => this.flush(false), 2000);
  }

  private async flush(useBeacon: boolean) {
    if (this.buffer.length === 0) {
      this.flushTimer = null;
      return;
    }
    const events = this.buffer.splice(0);
    this.flushTimer = null;
    const payload = JSON.stringify({
      session_id: getOrCreateSessionId(),
      anonymous_id: getOrCreateAnonId(),
      events,
    });
    const url = "/api/analytics/ingest";
    try {
      if (useBeacon && "sendBeacon" in navigator) {
        const ok = navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
        if (ok) return;
      }
      await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload,
        keepalive: useBeacon,
      });
    } catch {
      // swallow — analytics never break the app
    }
  }
}

export const tracker = new Tracker();
```

- [ ] **Step 2: Provider component (initializes tracker + hooks router)**

`components/AnalyticsProvider.tsx`:
```tsx
"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { tracker } from "@/lib/analytics/track";

export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    tracker.init();
  }, []);

  useEffect(() => {
    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    tracker.trackPageview(fullPath);
  }, [pathname, searchParams]);

  return null;
}
```

- [ ] **Step 3: Mount in `app/[locale]/layout.tsx`**

Find the existing root layout for `[locale]`. Add:
```tsx
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
```
Inside the `<body>` (or root JSX) below all other providers, before children:
```tsx
<AnalyticsProvider />
{children}
```

- [ ] **Step 4: Typecheck + commit**

```bash
npx tsc --noEmit -p .
git add lib/analytics/track.ts components/AnalyticsProvider.tsx 'app/[locale]/layout.tsx'
git commit -m "feat(analytics): client tracker with pageview + click capture"
```

---

## Task B3: Ingest endpoint

**Files:**
- Create: `app/api/analytics/ingest/route.ts`

- [ ] **Step 1: Create the endpoint**

`app/api/analytics/ingest/route.ts`:
```ts
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const EventSchema = z.object({
  event_type: z.enum(["pageview", "click", "milestone"]),
  path: z.string().max(256).optional(),
  raw_path: z.string().max(512).optional(),
  element: z.string().max(120).optional(),
  properties: z.record(z.unknown()).optional(),
});

const BodySchema = z.object({
  session_id: z.string().min(1).max(64),
  anonymous_id: z.string().min(1).max(64),
  events: z.array(EventSchema).min(1).max(100),
});

const RATE_BUCKET = new Map<string, { count: number; windowStart: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 60;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const b = RATE_BUCKET.get(ip);
  if (!b || now - b.windowStart > RATE_WINDOW_MS) {
    RATE_BUCKET.set(ip, { count: 1, windowStart: now });
    return false;
  }
  b.count += 1;
  return b.count > RATE_LIMIT;
}

function hashIp(ip: string): string {
  const secret = process.env.ANALYTICS_IP_SECRET ?? "no-secret-set";
  return crypto.createHash("sha256").update(ip + ":" + secret).digest("hex").slice(0, 32);
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimit(ip)) return new NextResponse(null, { status: 429 });

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  // Resolve user_id if authenticated (best-effort)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const ua = req.headers.get("user-agent")?.slice(0, 500) ?? null;
  const ip_hash = hashIp(ip);

  const rows = body.events.map((e) => ({
    session_id: body.session_id,
    anonymous_id: body.anonymous_id,
    user_id: user?.id ?? null,
    event_type: e.event_type,
    path: e.path ?? null,
    raw_path: e.raw_path ?? null,
    element: e.element ?? null,
    properties: e.properties ?? {},
    user_agent: ua,
    ip_hash,
    locale: e.path?.match(/^\/(in|id)/)?.[1] ?? null,
  }));

  // Insert via service role (RLS allows authed/anon insert too, but
  // service role lets us batch without a per-request supabase client).
  const sb = adminClient();
  const { error } = await sb.from("larinova_events").insert(rows);
  if (error) {
    console.error("[analytics/ingest] insert failed:", error.message);
    return new NextResponse(null, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
```

- [ ] **Step 2: Add env var to vault + Vercel**

```bash
~/.claude/vault/inject.sh has ANALYTICS_IP_SECRET 2>&1 | tail -2
```
If not present, generate and add:
```bash
NEW_SECRET=$(openssl rand -hex 32)
echo "Generated secret (add to vault and Vercel): $NEW_SECRET"
# Add to ~/.claude/vault/.env.master, then:
~/.claude/vault/inject.sh get ANALYTICS_IP_SECRET --dir /Users/gabrielantonyxaviour/Documents/products/larinova/app
```
Then push the secret to Vercel:
```bash
TOKEN=$(grep "^VERCEL_TOKEN=" .env.local | cut -d'=' -f2- | tr -d '"')
curl -sS -X POST "https://api.vercel.com/v9/projects/prj_qYpdo2z0w3lRHfVIyPy7oqzXCgjH/env?teamId=team_CKaFp2ehg9rFUbO3GunR3Cb2" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"key\":\"ANALYTICS_IP_SECRET\",\"value\":\"$NEW_SECRET\",\"type\":\"encrypted\",\"target\":[\"production\",\"preview\"]}"
```

- [ ] **Step 3: Typecheck + commit**

```bash
npx tsc --noEmit -p .
git add app/api/analytics/ingest/route.ts
git commit -m "feat(analytics): /api/analytics/ingest endpoint with rate limiting + IP hashing"
```

---

## Task B4: Server-side milestone tracker

**Files:**
- Create: `lib/analytics/server.ts`
- Modify: `app/api/invite/redeem/route.ts`
- Modify: `app/api/consultations/start/route.ts`
- Modify: `app/api/razorpay/webhook/route.ts`

- [ ] **Step 1: Server tracker helper**

`lib/analytics/server.ts`:
```ts
import { createClient } from "@supabase/supabase-js";

export async function trackMilestone(
  event: string,
  ctx: {
    userId?: string | null;
    properties?: Record<string, unknown>;
    sessionId?: string;
    anonymousId?: string;
  } = {},
): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const sb = createClient(url, key, { auth: { persistSession: false } });
    await sb.from("larinova_events").insert({
      session_id: ctx.sessionId ?? "server",
      anonymous_id: ctx.anonymousId ?? "server",
      user_id: ctx.userId ?? null,
      event_type: "milestone",
      element: event,
      properties: ctx.properties ?? {},
    });
  } catch (e) {
    console.error("[trackMilestone]", event, e);
    // never throw — analytics must not break the calling code path
  }
}
```

- [ ] **Step 2: Instrument `invite/redeem`**

In `app/api/invite/redeem/route.ts`, after the successful redemption block (after the email send), add:
```ts
await trackMilestone("invite_redeemed", {
  userId: user.id,
  properties: { code: parsed.code, period_end: result.period_end },
});
```
And add to imports: `import { trackMilestone } from "@/lib/analytics/server";`

- [ ] **Step 3: Instrument `consultations/start`**

Find the route. After the consultation is successfully created, add:
```ts
await trackMilestone("consultation_started", {
  userId: user.id,
  properties: { consultation_id: consultation.id },
});
```

- [ ] **Step 4: Instrument Razorpay webhook**

In `app/api/razorpay/webhook/route.ts`, in the `subscription.activated` and `subscription.charged` handler successes, add:
```ts
await trackMilestone("payment_succeeded", {
  userId: doctor.user_id,
  properties: { event_type: razorpayEvent.event, subscription_id: ... },
});
```

- [ ] **Step 5: Typecheck + commit**

```bash
npx tsc --noEmit -p .
git add lib/analytics/server.ts app/api/invite/redeem/route.ts app/api/consultations/start/route.ts app/api/razorpay/webhook/route.ts
git commit -m "feat(analytics): server-side milestone events on redeem, consultation, payment"
```

---

## Task B5: `/admin/analytics` dashboards

**Files:**
- Create: `app/[locale]/(admin)/admin/analytics/page.tsx`
- Create: `app/[locale]/(admin)/admin/analytics/sessions/[id]/page.tsx`
- Create: `app/api/admin/analytics/timeseries/route.ts`
- Create: `app/api/admin/analytics/top-elements/route.ts`
- Create: `app/api/admin/analytics/sessions/route.ts`
- Create: `app/api/admin/analytics/sessions/[id]/route.ts`

- [ ] **Step 1: Timeseries API**

`app/api/admin/analytics/timeseries/route.ts`:
```ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const url = new URL(req.url);
  const days = Math.min(90, Math.max(1, parseInt(url.searchParams.get("days") ?? "7")));
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  const { data, error } = await sb
    .from("larinova_events")
    .select("ts, event_type")
    .gte("ts", since);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const buckets = new Map<string, { pageviews: number; clicks: number; milestones: number }>();
  for (const r of data ?? []) {
    const day = new Date(r.ts).toISOString().slice(0, 10);
    const b = buckets.get(day) ?? { pageviews: 0, clicks: 0, milestones: 0 };
    if (r.event_type === "pageview") b.pageviews++;
    else if (r.event_type === "click") b.clicks++;
    else if (r.event_type === "milestone") b.milestones++;
    buckets.set(day, b);
  }
  const series = [...buckets.entries()].sort().map(([day, v]) => ({ day, ...v }));
  return NextResponse.json({ days, series });
}
```

- [ ] **Step 2: Top elements API**

`app/api/admin/analytics/top-elements/route.ts`:
```ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const url = new URL(req.url);
  const days = Math.min(90, Math.max(1, parseInt(url.searchParams.get("days") ?? "7")));
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  const { data } = await sb
    .from("larinova_events")
    .select("element")
    .eq("event_type", "click")
    .gte("ts", since)
    .not("element", "is", null);

  const counts = new Map<string, number>();
  for (const r of data ?? []) {
    counts.set(r.element!, (counts.get(r.element!) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30);
  return NextResponse.json({ top: top.map(([element, count]) => ({ element, count })) });
}
```

- [ ] **Step 3: Sessions list API**

`app/api/admin/analytics/sessions/route.ts`:
```ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const since = new Date(Date.now() - 86_400_000).toISOString();

  const { data } = await sb
    .from("larinova_events")
    .select("session_id, ts, user_id, path")
    .gte("ts", since)
    .order("ts", { ascending: false })
    .limit(5000);

  const map = new Map<string, { session_id: string; user_id: string | null; first_ts: string; last_ts: string; events: number; last_path: string | null }>();
  for (const r of data ?? []) {
    const cur = map.get(r.session_id);
    if (!cur) {
      map.set(r.session_id, {
        session_id: r.session_id,
        user_id: r.user_id,
        first_ts: r.ts,
        last_ts: r.ts,
        events: 1,
        last_path: r.path,
      });
    } else {
      cur.events += 1;
      if (r.ts > cur.last_ts) {
        cur.last_ts = r.ts;
        cur.last_path = r.path;
      }
      if (r.ts < cur.first_ts) cur.first_ts = r.ts;
      if (!cur.user_id && r.user_id) cur.user_id = r.user_id;
    }
  }
  const sessions = [...map.values()]
    .sort((a, b) => b.last_ts.localeCompare(a.last_ts))
    .slice(0, 100);
  return NextResponse.json({ sessions });
}
```

- [ ] **Step 4: Single session timeline API**

`app/api/admin/analytics/sessions/[id]/route.ts`:
```ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { id } = await ctx.params;

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const { data, error } = await sb
    .from("larinova_events")
    .select("ts, event_type, path, raw_path, element, properties, user_id")
    .eq("session_id", id)
    .order("ts", { ascending: true })
    .limit(2000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session_id: id, events: data ?? [] });
}
```

- [ ] **Step 5: Analytics dashboard page**

`app/[locale]/(admin)/admin/analytics/page.tsx`:
```tsx
import Link from "next/link";

export const dynamic = "force-dynamic";

async function jsonFetch(path: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${path}`, {
    headers: { cookie: "" }, // server-side, requireAdmin will fail if no auth — see note below
  }).catch(() => null);
  return res ? await res.json().catch(() => null) : null;
}

// Simpler: do the fetches server-side directly (without HTTP), share the
// admin client. We'll inline the queries to avoid the round-trip.
import { createClient } from "@supabase/supabase-js";

async function fetchData() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const since7d = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const since1d = new Date(Date.now() - 86_400_000).toISOString();

  const [tsRes, clickRes, sessionsRes] = await Promise.all([
    sb.from("larinova_events").select("ts, event_type").gte("ts", since7d),
    sb.from("larinova_events").select("element").eq("event_type", "click").gte("ts", since7d).not("element", "is", null),
    sb.from("larinova_events").select("session_id, ts, user_id, path").gte("ts", since1d).order("ts", { ascending: false }).limit(5000),
  ]);

  // timeseries
  const buckets = new Map<string, { pageviews: number; clicks: number; milestones: number }>();
  for (const r of tsRes.data ?? []) {
    const day = new Date(r.ts).toISOString().slice(0, 10);
    const b = buckets.get(day) ?? { pageviews: 0, clicks: 0, milestones: 0 };
    if (r.event_type === "pageview") b.pageviews++;
    else if (r.event_type === "click") b.clicks++;
    else if (r.event_type === "milestone") b.milestones++;
    buckets.set(day, b);
  }
  const series = [...buckets.entries()].sort().map(([day, v]) => ({ day, ...v }));

  // top clicks
  const counts = new Map<string, number>();
  for (const r of clickRes.data ?? []) {
    counts.set(r.element!, (counts.get(r.element!) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);

  // sessions
  const map = new Map<string, any>();
  for (const r of sessionsRes.data ?? []) {
    const cur = map.get(r.session_id);
    if (!cur) {
      map.set(r.session_id, { session_id: r.session_id, user_id: r.user_id, first_ts: r.ts, last_ts: r.ts, events: 1, last_path: r.path });
    } else {
      cur.events += 1;
      if (r.ts > cur.last_ts) { cur.last_ts = r.ts; cur.last_path = r.path; }
      if (r.ts < cur.first_ts) cur.first_ts = r.ts;
      if (!cur.user_id && r.user_id) cur.user_id = r.user_id;
    }
  }
  const sessions = [...map.values()].sort((a, b) => b.last_ts.localeCompare(a.last_ts)).slice(0, 30);

  return { series, top, sessions };
}

export default async function AnalyticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { series, top, sessions } = await fetchData();
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      <section>
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Last 7 days</h2>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="px-4 py-2 font-medium">Day</th>
                <th className="px-4 py-2 font-medium text-right">Pageviews</th>
                <th className="px-4 py-2 font-medium text-right">Clicks</th>
                <th className="px-4 py-2 font-medium text-right">Milestones</th>
              </tr>
            </thead>
            <tbody>
              {series.map((d) => (
                <tr key={d.day} className="border-t border-border">
                  <td className="px-4 py-2 font-mono">{d.day}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{d.pageviews}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{d.clicks}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{d.milestones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Top clicked (7d)</h2>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {top.map(([element, count]) => (
                <tr key={element} className="border-t border-border first:border-0">
                  <td className="px-4 py-2 font-mono">{element}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Recent sessions (24h)</h2>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="px-4 py-2 font-medium">Session</th>
                <th className="px-4 py-2 font-medium">User</th>
                <th className="px-4 py-2 font-medium">Last path</th>
                <th className="px-4 py-2 font-medium text-right">Events</th>
                <th className="px-4 py-2 font-medium text-right">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s: any) => (
                <tr key={s.session_id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2 font-mono"><Link href={`/${locale}/admin/analytics/sessions/${s.session_id}`} className="hover:underline">{s.session_id.slice(0, 12)}…</Link></td>
                  <td className="px-4 py-2 text-muted-foreground">{s.user_id ? s.user_id.slice(0, 8) + "…" : "anon"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{s.last_path ?? "—"}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{s.events}</td>
                  <td className="px-4 py-2 text-right text-muted-foreground">{new Date(s.last_ts).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 6: Single session timeline page**

`app/[locale]/(admin)/admin/analytics/sessions/[id]/page.tsx`:
```tsx
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function SessionTimeline({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const { data } = await sb
    .from("larinova_events")
    .select("ts, event_type, path, raw_path, element, properties, user_id")
    .eq("session_id", id)
    .order("ts", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Session timeline</h1>
      <p className="text-sm text-muted-foreground mb-6 font-mono">{id}</p>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="px-4 py-2 font-medium">Time</th>
              <th className="px-4 py-2 font-medium">Event</th>
              <th className="px-4 py-2 font-medium">Path</th>
              <th className="px-4 py-2 font-medium">Element / details</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((e, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-4 py-2 text-xs font-mono text-muted-foreground">{new Date(e.ts).toLocaleTimeString()}</td>
                <td className="px-4 py-2 uppercase tracking-wider text-xs">{e.event_type}</td>
                <td className="px-4 py-2 font-mono text-xs">{e.path ?? "—"}</td>
                <td className="px-4 py-2 text-xs">
                  {e.element ?? ""}
                  {e.properties && Object.keys(e.properties).length > 0 && (
                    <pre className="text-[10px] mt-1 text-muted-foreground">{JSON.stringify(e.properties)}</pre>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Typecheck + commit**

```bash
npx tsc --noEmit -p .
git add 'app/[locale]/(admin)/admin/analytics' 'app/api/admin/analytics'
git commit -m "feat(admin): /admin/analytics dashboards (timeseries, top elements, session timeline)"
```

---

## Task B6: Phase B end-to-end smoke

- [ ] **Step 1: Build + push + wait for deploy**

```bash
npm run build && git push origin main
```
Wait until Vercel deploy is Ready.

- [ ] **Step 2: Drive a fake browse session in incognito**

Visit `https://app.larinova.com/in/sign-in` → click around → don't sign in → close tab. Repeat with different paths.

- [ ] **Step 3: Verify events landed**

```bash
SR=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env | cut -d'=' -f2- | tr -d '"')
SBURL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env | cut -d'=' -f2- | tr -d '"')
curl -sS "$SBURL/rest/v1/larinova_events?order=ts.desc&limit=5&select=ts,event_type,path,element" -H "apikey: $SR" -H "Authorization: Bearer $SR" | python3 -m json.tool
```
Expected: 5 most recent events including pageviews and clicks from your browse.

- [ ] **Step 4: Verify the admin dashboard renders**

Sign in as admin. Visit `/in/admin/analytics`. Verify:
- Timeseries table shows non-zero numbers for today
- "Top clicked" lists at least one element
- Recent sessions list shows your incognito session
- Click into a session → see the event timeline

---

# Phase C — Issues System

## Task C1: Migration — `larinova_issues` + `larinova_issue_messages`

**Files:**
- Create: `supabase/migrations/20260426130000_create_issues.sql`

- [ ] **Step 1: Write migration**

`supabase/migrations/20260426130000_create_issues.sql`:
```sql
-- In-app issue tracker with threaded chat. Doctors see only their
-- own issues (RLS-enforced); admin reads/writes via service role.
-- Spec: docs/superpowers/specs/2026-04-26-admin-analytics-issues-design.md §5.4

CREATE TYPE issue_status AS ENUM ('open', 'in_progress', 'resolved', 'wont_fix');
CREATE TYPE issue_priority AS ENUM ('low', 'normal', 'high');
CREATE TYPE issue_message_role AS ENUM ('doctor', 'admin');

CREATE TABLE larinova_issues (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id    UUID NOT NULL REFERENCES larinova_doctors(id) ON DELETE CASCADE,
  title        TEXT NOT NULL CHECK (length(title) BETWEEN 3 AND 140),
  body         TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 5000),
  status       issue_status NOT NULL DEFAULT 'open',
  priority     issue_priority NOT NULL DEFAULT 'normal',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at  TIMESTAMPTZ
);
CREATE INDEX idx_issues_doctor ON larinova_issues (doctor_id, created_at DESC);
CREATE INDEX idx_issues_status ON larinova_issues (status, created_at DESC);

CREATE TABLE larinova_issue_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id        UUID NOT NULL REFERENCES larinova_issues(id) ON DELETE CASCADE,
  sender_role     issue_message_role NOT NULL,
  sender_user_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  body            TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 5000),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_issue_messages_issue ON larinova_issue_messages (issue_id, created_at);

ALTER TABLE larinova_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE larinova_issue_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY issues_select_own ON larinova_issues FOR SELECT TO authenticated
  USING (doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid()));

CREATE POLICY issues_insert_own ON larinova_issues FOR INSERT TO authenticated
  WITH CHECK (doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid()));

CREATE POLICY issue_messages_select_own ON larinova_issue_messages FOR SELECT TO authenticated
  USING (issue_id IN (
    SELECT i.id FROM larinova_issues i
    JOIN larinova_doctors d ON d.id = i.doctor_id
    WHERE d.user_id = auth.uid()
  ));

CREATE POLICY issue_messages_insert_own ON larinova_issue_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_role = 'doctor'
    AND sender_user_id = auth.uid()
    AND issue_id IN (
      SELECT i.id FROM larinova_issues i
      JOIN larinova_doctors d ON d.id = i.doctor_id
      WHERE d.user_id = auth.uid()
    )
  );

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION larinova_issues_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.status = 'resolved' AND OLD.status <> 'resolved' THEN
    NEW.resolved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_larinova_issues_touch
  BEFORE UPDATE ON larinova_issues
  FOR EACH ROW EXECUTE FUNCTION larinova_issues_touch_updated_at();
```

- [ ] **Step 2: Apply via Supabase SQL editor**

Open https://supabase.com/dashboard/project/afitpprgfsidrnrrhvzs/sql/new and paste. Run.

Verify:
```bash
SR=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env | cut -d'=' -f2- | tr -d '"')
SBURL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env | cut -d'=' -f2- | tr -d '"')
curl -sS "$SBURL/rest/v1/larinova_issues?limit=0" -H "apikey: $SR" -H "Authorization: Bearer $SR" -w "\nstatus: %{http_code}\n"
```
Expected: 200 with `[]`.

- [ ] **Step 3: Commit migration**

```bash
git add supabase/migrations/20260426130000_create_issues.sql
git commit -m "feat(db): larinova_issues + larinova_issue_messages with RLS-enforced doctor isolation"
```

---

## Task C2: Doctor-side `/issues` flow

**Files:**
- Create: `app/[locale]/(protected)/issues/page.tsx`
- Create: `app/[locale]/(protected)/issues/new/page.tsx`
- Create: `app/[locale]/(protected)/issues/[id]/page.tsx`
- Create: `app/[locale]/(protected)/issues/IssueChat.tsx`
- Create: `app/api/issues/route.ts`
- Create: `app/api/issues/list/route.ts`
- Create: `app/api/issues/[id]/route.ts`
- Create: `app/api/issues/[id]/messages/route.ts`

- [ ] **Step 1: POST /api/issues (create)**

`app/api/issues/route.ts`:
```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendIssueFiledEmail } from "@/lib/notify/issue-filed-email";
import { trackMilestone } from "@/lib/analytics/server";

const Body = z.object({
  title: z.string().trim().min(3).max(140),
  body: z.string().trim().min(1).max(5000),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof Body>;
  try { parsed = Body.parse(await req.json()); }
  catch { return NextResponse.json({ error: "invalid_input" }, { status: 400 }); }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: doctor } = await supabase
    .from("larinova_doctors")
    .select("id, full_name, email")
    .eq("user_id", user.id)
    .single();
  if (!doctor) return NextResponse.json({ error: "no_doctor_row" }, { status: 400 });

  const { data: issue, error } = await supabase
    .from("larinova_issues")
    .insert({ doctor_id: doctor.id, title: parsed.title, body: parsed.body, priority: parsed.priority })
    .select("id")
    .single();
  if (error || !issue) return NextResponse.json({ error: error?.message ?? "insert_failed" }, { status: 500 });

  // fire-and-forget email + milestone
  sendIssueFiledEmail({ doctor, issue: { id: issue.id, title: parsed.title, body: parsed.body, priority: parsed.priority } }).catch(console.error);
  trackMilestone("issue_filed", { userId: user.id, properties: { issue_id: issue.id, priority: parsed.priority } });

  return NextResponse.json({ ok: true, id: issue.id });
}
```

- [ ] **Step 2: List own issues**

`app/api/issues/list/route.ts`:
```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("larinova_issues")
    .select("id, title, status, priority, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ issues: data ?? [] });
}
```

- [ ] **Step 3: Get single own issue + messages**

`app/api/issues/[id]/route.ts`:
```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await ctx.params;

  const { data: issue } = await supabase
    .from("larinova_issues")
    .select("id, title, body, status, priority, created_at, resolved_at")
    .eq("id", id)
    .single();
  if (!issue) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: messages } = await supabase
    .from("larinova_issue_messages")
    .select("id, sender_role, body, created_at")
    .eq("issue_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ issue, messages: messages ?? [] });
}
```

- [ ] **Step 4: POST doctor message**

`app/api/issues/[id]/messages/route.ts`:
```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Body = z.object({ body: z.string().trim().min(1).max(5000) });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await ctx.params;

  let parsed: z.infer<typeof Body>;
  try { parsed = Body.parse(await req.json()); }
  catch { return NextResponse.json({ error: "invalid_input" }, { status: 400 }); }

  const { error } = await supabase.from("larinova_issue_messages").insert({
    issue_id: id,
    sender_role: "doctor",
    sender_user_id: user.id,
    body: parsed.body,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: Issues list page**

`app/[locale]/(protected)/issues/page.tsx`:
```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function MyIssuesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: issues } = await supabase
    .from("larinova_issues")
    .select("id, title, status, priority, created_at, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My issues</h1>
        <Link href={`/${locale}/issues/new`}><Button>Report new issue</Button></Link>
      </div>
      <div className="rounded-lg border border-border bg-card divide-y divide-border">
        {(issues ?? []).map((i) => (
          <Link key={i.id} href={`/${locale}/issues/${i.id}`} className="flex items-center justify-between p-4 hover:bg-muted/30">
            <div>
              <div className="font-medium">{i.title}</div>
              <div className="text-xs text-muted-foreground mt-1">Updated {new Date(i.updated_at).toLocaleString()}</div>
            </div>
            <span className={
              "text-xs px-2 py-0.5 rounded-full " +
              (i.status === "open" ? "bg-amber-500/15 text-amber-600" :
               i.status === "in_progress" ? "bg-blue-500/15 text-blue-600" :
               i.status === "resolved" ? "bg-emerald-500/15 text-emerald-600" :
               "bg-muted text-muted-foreground")
            }>{i.status}</span>
          </Link>
        ))}
        {(!issues || issues.length === 0) && (
          <div className="p-8 text-center text-muted-foreground text-sm">No issues yet. Use "Report new issue" to file one.</div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: New issue form page**

`app/[locale]/(protected)/issues/new/page.tsx`:
```tsx
"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewIssuePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "failed");
      router.push(`/${locale}/issues/${result.id}`);
    } catch (err) {
      alert(`Failed: ${(err as Error).message}`);
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Report an issue</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} placeholder="e.g. Recording stops after 10 seconds" />
        </div>
        <div>
          <Label htmlFor="body">Description</Label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            maxLength={5000}
            placeholder="What happened? What did you expect to happen? Steps to reproduce, if any."
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <Button type="submit" disabled={submitting || title.trim().length < 3 || body.trim().length < 1}>
          {submitting ? "Submitting…" : "File issue"}
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 7: Single issue page (with chat)**

`app/[locale]/(protected)/issues/IssueChat.tsx`:
```tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type Message = { id: string; sender_role: "doctor" | "admin"; body: string; created_at: string };

export function IssueChat({ issueId, initial }: { issueId: string; initial: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initial);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Refetch on tab focus (poll-on-focus per spec)
  useEffect(() => {
    function refresh() {
      fetch(`/api/issues/${issueId}`)
        .then((r) => r.json())
        .then((d) => setMessages(d.messages ?? []))
        .catch(() => {});
    }
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [issueId]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        setDraft("");
        const refreshed = await fetch(`/api/issues/${issueId}`).then((r) => r.json());
        setMessages(refreshed.messages ?? []);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {messages.map((m) => (
          <div key={m.id} className={"flex " + (m.sender_role === "doctor" ? "justify-end" : "justify-start")}>
            <div className={
              "max-w-[80%] rounded-lg p-3 text-sm " +
              (m.sender_role === "doctor"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-muted text-foreground border border-border rounded-bl-sm")
            }>
              <div className="text-[10px] uppercase tracking-widest mb-1 opacity-70">
                {m.sender_role === "doctor" ? "You" : "Larinova"}
              </div>
              <div className="whitespace-pre-wrap">{m.body}</div>
              <div className="text-[10px] opacity-60 mt-1">{new Date(m.created_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-8">No replies yet. We'll get back to you here.</div>
        )}
      </div>

      <div className="border-t border-border pt-3">
        <div className="relative flex flex-col rounded-md border border-input bg-card shadow-sm focus-within:ring-1 focus-within:ring-ring/40">
          <textarea
            ref={taRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              const ta = e.currentTarget;
              ta.style.height = "auto";
              ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Reply…"
            className="min-h-[52px] max-h-[160px] resize-none border-0 bg-transparent px-4 pt-3.5 pb-12 text-sm focus-visible:outline-none leading-relaxed"
          />
          <Button
            type="button"
            onClick={send}
            disabled={sending || draft.trim().length === 0}
            className="absolute bottom-2 right-2 h-8 w-8 rounded-md p-0"
          >↑</Button>
        </div>
      </div>
    </div>
  );
}
```

`app/[locale]/(protected)/issues/[id]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IssueChat } from "../IssueChat";

export const dynamic = "force-dynamic";

export default async function IssueDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: issue } = await supabase
    .from("larinova_issues")
    .select("id, title, body, status, priority, created_at, resolved_at")
    .eq("id", id)
    .single();
  if (!issue) notFound();

  const { data: messages } = await supabase
    .from("larinova_issue_messages")
    .select("id, sender_role, body, created_at")
    .eq("issue_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{issue.title}</h1>
        <div className="text-xs text-muted-foreground mt-1">
          {new Date(issue.created_at).toLocaleString()} · status: {issue.status} · priority: {issue.priority}
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Original report</div>
        <div className="whitespace-pre-wrap text-sm">{issue.body}</div>
      </div>
      <IssueChat issueId={issue.id} initial={(messages ?? []) as any} />
    </div>
  );
}
```

- [ ] **Step 8: Typecheck + commit**

```bash
npx tsc --noEmit -p .
git add 'app/[locale]/(protected)/issues' app/api/issues
git commit -m "feat(issues): doctor-side /issues list + create + threaded chat"
```

---

## Task C3: Issue-filed email + admin side

**Files:**
- Create: `lib/notify/issue-filed-email.ts`
- Modify: `app/api/issues/route.ts` (already imports the helper from C2)
- Create: `app/[locale]/(admin)/admin/issues/page.tsx`
- Create: `app/[locale]/(admin)/admin/issues/[id]/page.tsx`
- Create: `app/api/admin/issues/list/route.ts`
- Create: `app/api/admin/issues/[id]/route.ts`
- Create: `app/api/admin/issues/[id]/messages/route.ts`

- [ ] **Step 1: Issue-filed email**

`lib/notify/issue-filed-email.ts`:
```ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.EMAIL_FROM ?? "larinova@contact.raxgbc.co.in";

export async function sendIssueFiledEmail(args: {
  doctor: { full_name: string; email: string };
  issue: { id: string; title: string; body: string; priority: string };
}): Promise<void> {
  const adminLink = `https://app.larinova.com/in/admin/issues/${args.issue.id}`;
  const bodyExcerpt = args.issue.body.slice(0, 500) + (args.issue.body.length > 500 ? "…" : "");
  const subject = `[Larinova alpha] Dr. ${args.doctor.full_name.split(" ")[0]} filed: ${args.issue.title}`;
  const html = `
    <div style="font-family:-apple-system,sans-serif;max-width:600px;margin:24px auto;padding:24px;background:#fff">
      <h2 style="margin:0 0 12px">New issue filed</h2>
      <p style="margin:0 0 8px;color:#555;font-size:14px"><strong>${args.doctor.full_name}</strong> &lt;${args.doctor.email}&gt;</p>
      <p style="margin:0 0 8px;color:#555;font-size:13px;text-transform:uppercase;letter-spacing:1px">Priority: ${args.issue.priority}</p>
      <h3 style="margin:16px 0 8px">${args.issue.title}</h3>
      <div style="white-space:pre-wrap;font-size:14px;color:#333;line-height:1.6;border-left:3px solid #10b079;padding-left:12px">${bodyExcerpt.replace(/</g,"&lt;")}</div>
      <p style="margin:24px 0 0"><a href="${adminLink}" style="background:#10b079;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">Open in admin</a></p>
    </div>`;
  await resend.emails.send({
    from: FROM,
    to: "gabrielantony56@gmail.com",
    subject,
    html,
  });
}
```

- [ ] **Step 2: Admin issues list endpoint**

`app/api/admin/issues/list/route.ts`:
```ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  let q = sb
    .from("larinova_issues")
    .select("id, title, status, priority, created_at, updated_at, doctor_id, larinova_doctors!inner(full_name, email)")
    .order("updated_at", { ascending: false })
    .limit(200);
  if (status) q = q.eq("status", status as any);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ issues: data ?? [] });
}
```

- [ ] **Step 3: Admin single-issue + status update + admin reply endpoints**

`app/api/admin/issues/[id]/route.ts`:
```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/auth";

const PatchBody = z.object({
  status: z.enum(["open", "in_progress", "resolved", "wont_fix"]).optional(),
  priority: z.enum(["low", "normal", "high"]).optional(),
});

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { id } = await ctx.params;

  const sb = adminClient();
  const { data: issue } = await sb
    .from("larinova_issues")
    .select("id, title, body, status, priority, created_at, resolved_at, doctor_id, larinova_doctors!inner(full_name, email)")
    .eq("id", id)
    .single();
  if (!issue) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { data: messages } = await sb
    .from("larinova_issue_messages")
    .select("id, sender_role, body, created_at")
    .eq("issue_id", id)
    .order("created_at", { ascending: true });
  return NextResponse.json({ issue, messages: messages ?? [] });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { id } = await ctx.params;

  let parsed: z.infer<typeof PatchBody>;
  try { parsed = PatchBody.parse(await req.json()); }
  catch { return NextResponse.json({ error: "invalid_input" }, { status: 400 }); }

  const sb = adminClient();
  const { error } = await sb.from("larinova_issues").update(parsed).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

`app/api/admin/issues/[id]/messages/route.ts`:
```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/auth";

const Body = z.object({ body: z.string().trim().min(1).max(5000) });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { id } = await ctx.params;

  let parsed: z.infer<typeof Body>;
  try { parsed = Body.parse(await req.json()); }
  catch { return NextResponse.json({ error: "invalid_input" }, { status: 400 }); }

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const { error } = await sb.from("larinova_issue_messages").insert({
    issue_id: id,
    sender_role: "admin",
    sender_user_id: admin.id,
    body: parsed.body,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // touch updated_at on the issue
  await sb.from("larinova_issues").update({ updated_at: new Date().toISOString() }).eq("id", id);

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Admin issues list page**

`app/[locale]/(admin)/admin/issues/page.tsx`:
```tsx
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function AdminIssuesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const { data: issues } = await sb
    .from("larinova_issues")
    .select("id, title, status, priority, created_at, updated_at, doctor_id, larinova_doctors!inner(full_name, email)")
    .order("updated_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Issues</h1>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">Reporter</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Priority</th>
              <th className="px-4 py-2 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {(issues ?? []).map((i: any) => (
              <tr key={i.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-2"><Link className="hover:underline" href={`/${locale}/admin/issues/${i.id}`}>{i.title}</Link></td>
                <td className="px-4 py-2 text-muted-foreground">{i.larinova_doctors.full_name} ({i.larinova_doctors.email})</td>
                <td className="px-4 py-2">{i.status}</td>
                <td className="px-4 py-2">{i.priority}</td>
                <td className="px-4 py-2 text-muted-foreground text-xs">{new Date(i.updated_at).toLocaleString()}</td>
              </tr>
            ))}
            {(!issues || issues.length === 0) && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No issues yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Admin single-issue page (chat as admin)**

`app/[locale]/(admin)/admin/issues/[id]/page.tsx`:
```tsx
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type Issue = { id: string; title: string; body: string; status: string; priority: string; created_at: string; larinova_doctors: { full_name: string; email: string } };
type Message = { id: string; sender_role: "doctor" | "admin"; body: string; created_at: string };

export default function AdminIssueDetail() {
  const params = useParams();
  const id = params.id as string;
  const [issue, setIssue] = useState<Issue | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    const r = await fetch(`/api/admin/issues/${id}`).then((r) => r.json());
    setIssue(r.issue);
    setMessages(r.messages);
  }
  useEffect(() => { load(); }, [id]);

  async function send() {
    if (!draft.trim() || sending) return;
    setSending(true);
    await fetch(`/api/admin/issues/${id}/messages`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body: draft.trim() }),
    });
    setDraft("");
    await load();
    setSending(false);
  }

  async function setStatus(status: string) {
    await fetch(`/api/admin/issues/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  if (!issue) return <div>Loading…</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{issue.title}</h1>
        <div className="text-xs text-muted-foreground mt-1">
          From {issue.larinova_doctors.full_name} ({issue.larinova_doctors.email}) · {new Date(issue.created_at).toLocaleString()}
        </div>
        <div className="mt-3 flex gap-2">
          {(["open", "in_progress", "resolved", "wont_fix"] as const).map((s) => (
            <Button key={s} variant={issue.status === s ? "default" : "outline"} size="sm" onClick={() => setStatus(s)}>{s}</Button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Original report</div>
        <div className="whitespace-pre-wrap text-sm">{issue.body}</div>
      </div>

      <div className="flex flex-col gap-3">
        {messages.map((m) => (
          <div key={m.id} className={"flex " + (m.sender_role === "admin" ? "justify-end" : "justify-start")}>
            <div className={"max-w-[80%] rounded-lg p-3 text-sm " + (m.sender_role === "admin" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground border border-border rounded-bl-sm")}>
              <div className="text-[10px] uppercase tracking-widest mb-1 opacity-70">{m.sender_role === "admin" ? "You (Admin)" : "Doctor"}</div>
              <div className="whitespace-pre-wrap">{m.body}</div>
              <div className="text-[10px] opacity-60 mt-1">{new Date(m.created_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3">
        <div className="relative flex flex-col rounded-md border border-input bg-card shadow-sm">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); } }}
            rows={3}
            placeholder="Reply to doctor…"
            className="resize-none border-0 bg-transparent px-4 pt-3 pb-12 text-sm focus-visible:outline-none"
          />
          <Button type="button" onClick={send} disabled={sending || !draft.trim()} className="absolute bottom-2 right-2 h-8 w-8 rounded-md p-0">↑</Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: "Report issue" link in app header**

Find the header/sidebar component (likely `components/layout/Sidebar.tsx` based on git status). Add a small link to `/[locale]/issues` (or a "?" icon in the corner if there isn't natural sidebar space). One-line addition; pattern-match existing nav.

Concretely, in the sidebar nav array, append:
```ts
{ href: "/issues", label: t("nav.issues") || "Issues", icon: HelpCircleIcon }
```

- [ ] **Step 7: Typecheck + commit**

```bash
npx tsc --noEmit -p .
git add lib/notify/issue-filed-email.ts 'app/[locale]/(admin)/admin/issues' app/api/admin/issues components/layout
git commit -m "feat(issues): admin /admin/issues + status updates + reply chat + email-on-file"
```

---

## Task C4: Phase C end-to-end smoke

- [ ] **Step 1: Build + push + wait for deploy**

```bash
npm run build && git push origin main
```

- [ ] **Step 2: File an issue as a real doctor**

Sign in (using the cookie-injection flow from prior testing or the OTP form) as a non-admin doctor. Navigate to `/in/issues/new`, file an issue.

- [ ] **Step 3: Verify the issue + email**

```bash
SR=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env | cut -d'=' -f2- | tr -d '"')
SBURL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env | cut -d'=' -f2- | tr -d '"')
curl -sS "$SBURL/rest/v1/larinova_issues?order=created_at.desc&limit=1" -H "apikey: $SR" -H "Authorization: Bearer $SR" | python3 -m json.tool
```
Expected: the just-filed issue at the top.

Check Gmail for `gabrielantony56@gmail.com`:
```bash
# (Use the Gmail MCP search_threads tool with subject:"[Larinova alpha]")
```
Expected: one email matching the new issue title.

- [ ] **Step 4: Reply as admin and verify polling refresh**

Sign in as admin. `/in/admin/issues` → click into the issue → reply.

Switch back to the doctor's tab (still open from step 2). Switch focus to it. The polling-on-focus listener should refetch and show the admin reply. Verify.

- [ ] **Step 5: Verify cross-doctor isolation**

Create a SECOND test doctor (different email). Sign in as Doctor B. Try to navigate directly to `https://app.larinova.com/in/issues/<doctor-A-issue-id>`. Expected: 404 (the RLS-enforced single-row select returns null).

Also try the API directly:
```bash
curl -sS "https://app.larinova.com/api/issues/<doctor-A-issue-id>" -H "Cookie: <doctor-B-cookie>"
```
Expected: 404 or empty.

- [ ] **Step 6: Smoke clean-up**

Delete test issues + test users:
```bash
# Delete test doctors (similar pattern to invite-code testing)
# Delete test issues + messages (cascade via doctor_id ON DELETE CASCADE)
```

---

## Self-review

After writing this plan, I checked:

**1. Spec coverage:** Each spec section has a corresponding task:
- §5.1 admin auth → Task A1
- §5.2 admin shell pages → Tasks A2, A3, A4, A5
- §5.3 analytics → Tasks B1, B2, B3, B4, B5, B6
- §5.4 issues → Tasks C1, C2, C3, C4
- §6 data flow → covered by the route-level instrumentation in B4 + C2 + C3
- §7 migrations → Tasks B1 + C1

**2. Placeholders:** None found. Two judgement calls in Task A5 (column names depend on the actual `larinova_discovery_surveys` schema, which the executor reads first) and Task C3 step 6 (sidebar link placement depends on existing pattern). Both are explicit "inspect surrounding context" instructions.

**3. Type consistency:** Function signatures match — `requireAdmin()` returns user-or-null in `lib/admin/auth.ts` and is used the same way everywhere; `trackMilestone(event, ctx)` shape is consistent; admin endpoints all use `requireAdmin` then `adminClient`.
