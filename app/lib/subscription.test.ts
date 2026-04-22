import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import {
  isWhitelisted,
  PRO_WHITELIST,
  emailInList,
  getMonthlyConsultationCount,
  startOfMonthUtcISO,
  checkConsultationLimit,
  upgradeIfWhitelisted,
} from "./subscription";
import { FREE_TIER_CONSULTATION_LIMIT } from "@/types/billing";

type Filter = { field: string; value: unknown };

function makeSupabaseWithCount(count: number) {
  const filters: Filter[] = [];
  const builder: any = {
    _filters: filters,
    select: vi.fn().mockImplementation(() => builder),
    eq: vi.fn().mockImplementation((field: string, value: unknown) => {
      filters.push({ field, value });
      return builder;
    }),
    gte: vi.fn().mockImplementation((field: string, value: unknown) => {
      filters.push({ field, value });
      return Promise.resolve({ count, error: null });
    }),
  };
  const from = vi.fn().mockImplementation(() => builder);
  return { supabase: { from }, builder, from };
}

function makeSupabaseRouted(opts: {
  subscription: Record<string, unknown> | null;
  consultationCount: number;
}) {
  const subBuilder: any = {
    select: vi.fn().mockImplementation(() => subBuilder),
    eq: vi.fn().mockImplementation(() => subBuilder),
    single: vi.fn().mockResolvedValue({ data: opts.subscription, error: null }),
  };
  const consultFilters: Filter[] = [];
  const consultBuilder: any = {
    _filters: consultFilters,
    select: vi.fn().mockImplementation(() => consultBuilder),
    eq: vi.fn().mockImplementation((field: string, value: unknown) => {
      consultFilters.push({ field, value });
      return consultBuilder;
    }),
    gte: vi.fn().mockImplementation((field: string, value: unknown) => {
      consultFilters.push({ field, value });
      return Promise.resolve({ count: opts.consultationCount, error: null });
    }),
  };
  const from = vi.fn().mockImplementation((table: string) => {
    if (table === "larinova_subscriptions") return subBuilder;
    if (table === "larinova_consultations") return consultBuilder;
    throw new Error(`unexpected table: ${table}`);
  });
  return { supabase: { from }, subBuilder, consultBuilder };
}

describe("PRO_WHITELIST", () => {
  it("is an array of strings", () => {
    expect(Array.isArray(PRO_WHITELIST)).toBe(true);
    for (const e of PRO_WHITELIST) expect(typeof e).toBe("string");
  });
});

describe("emailInList", () => {
  it("returns false for an empty list", () => {
    expect(emailInList("any@example.com", [])).toBe(false);
  });

  it("returns true when email appears in the list exactly", () => {
    expect(emailInList("a@b.com", ["a@b.com"])).toBe(true);
  });

  it("is case-insensitive on both sides", () => {
    expect(emailInList("FOO@BAR.com", ["foo@bar.com"])).toBe(true);
    expect(emailInList("foo@bar.com", ["FOO@BAR.COM"])).toBe(true);
  });
});

describe("isWhitelisted", () => {
  it("returns false for an email not in the whitelist", () => {
    expect(isWhitelisted("nobody-12345@example.com")).toBe(false);
  });
});

describe("startOfMonthUtcISO", () => {
  it("returns the first day of the current month at 00:00:00 UTC", () => {
    const ref = new Date(Date.UTC(2026, 3, 23, 17, 42, 11));
    expect(startOfMonthUtcISO(ref)).toBe("2026-04-01T00:00:00.000Z");
  });

  it("handles December rollover correctly", () => {
    const ref = new Date(Date.UTC(2025, 11, 31, 23, 59, 59));
    expect(startOfMonthUtcISO(ref)).toBe("2025-12-01T00:00:00.000Z");
  });
});

function makeUpgradeSupabase(opts: { alphaWelcomedAt: string | null }) {
  const doctorSelect: any = {
    select: vi.fn().mockImplementation(() => doctorSelect),
    eq: vi.fn().mockImplementation(() => doctorSelect),
    single: vi.fn().mockResolvedValue({
      data: { id: "doc-1", alpha_welcomed_at: opts.alphaWelcomedAt },
      error: null,
    }),
  };
  const doctorUpdate = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  });
  const doctorBuilder: any = {
    select: doctorSelect.select,
    eq: doctorSelect.eq,
    single: doctorSelect.single,
    update: doctorUpdate,
  };
  const upsert = vi.fn().mockResolvedValue({ error: null });
  const subBuilder: any = { upsert };
  const from = vi.fn().mockImplementation((table: string) => {
    if (table === "larinova_doctors") return doctorBuilder;
    if (table === "larinova_subscriptions") return subBuilder;
    throw new Error(`unexpected table: ${table}`);
  });
  return { supabase: { from }, upsert, doctorUpdate };
}

describe("upgradeIfWhitelisted", () => {
  beforeEach(() => {
    vi.mocked(createClient).mockReset();
  });

  it("returns {upgraded:false, firstTime:false} for an email not whitelisted", async () => {
    const { supabase } = makeUpgradeSupabase({ alphaWelcomedAt: null });
    vi.mocked(createClient).mockResolvedValue(supabase as any);
    const result = await upgradeIfWhitelisted("outsider@example.com", "doc-1");
    expect(result).toEqual({ upgraded: false, firstTime: false });
  });

  it("upserts pro subscription + sets is_alpha + calls welcome on first time", async () => {
    const whitelistedEmail = "alpha.dr@test.larinova.com";
    (PRO_WHITELIST as unknown as string[]).push(whitelistedEmail);
    try {
      const { supabase, upsert, doctorUpdate } = makeUpgradeSupabase({
        alphaWelcomedAt: null,
      });
      vi.mocked(createClient).mockResolvedValue(supabase as any);
      const welcome = vi.fn().mockResolvedValue(true);

      const result = await upgradeIfWhitelisted(
        whitelistedEmail,
        "doc-1",
        welcome,
      );

      expect(result.upgraded).toBe(true);
      expect(result.firstTime).toBe(true);
      expect(welcome).toHaveBeenCalledWith("doc-1");
      expect(upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          doctor_id: "doc-1",
          plan: "pro",
          status: "whitelisted",
          billing_interval: null,
          razorpay_subscription_id: null,
        }),
        expect.objectContaining({ onConflict: "doctor_id" }),
      );
      expect(doctorUpdate).toHaveBeenCalled();
      const updatePayload = doctorUpdate.mock.calls[0][0];
      expect(updatePayload.is_alpha).toBe(true);
      expect(typeof updatePayload.alpha_welcomed_at).toBe("string");
    } finally {
      (PRO_WHITELIST as unknown as string[]).pop();
    }
  });

  it("skips welcome + alpha_welcomed_at when already welcomed", async () => {
    const whitelistedEmail = "alpha.dr2@test.larinova.com";
    (PRO_WHITELIST as unknown as string[]).push(whitelistedEmail);
    try {
      const { supabase, upsert, doctorUpdate } = makeUpgradeSupabase({
        alphaWelcomedAt: "2026-04-20T10:00:00.000Z",
      });
      vi.mocked(createClient).mockResolvedValue(supabase as any);
      const welcome = vi.fn().mockResolvedValue(true);

      const result = await upgradeIfWhitelisted(
        whitelistedEmail,
        "doc-2",
        welcome,
      );

      expect(result.upgraded).toBe(true);
      expect(result.firstTime).toBe(false);
      expect(welcome).not.toHaveBeenCalled();
      expect(upsert).toHaveBeenCalled();
      if (doctorUpdate.mock.calls.length > 0) {
        const updatePayload = doctorUpdate.mock.calls[0][0];
        expect(updatePayload.alpha_welcomed_at).toBeUndefined();
      }
    } finally {
      (PRO_WHITELIST as unknown as string[]).pop();
    }
  });

  it("does NOT set alpha_welcomed_at when welcome callback fails", async () => {
    const whitelistedEmail = "alpha.dr3@test.larinova.com";
    (PRO_WHITELIST as unknown as string[]).push(whitelistedEmail);
    try {
      const { supabase, doctorUpdate } = makeUpgradeSupabase({
        alphaWelcomedAt: null,
      });
      vi.mocked(createClient).mockResolvedValue(supabase as any);
      const welcome = vi.fn().mockResolvedValue(false);

      const result = await upgradeIfWhitelisted(
        whitelistedEmail,
        "doc-3",
        welcome,
      );

      expect(result.upgraded).toBe(true);
      expect(result.firstTime).toBe(true);
      const updatePayload = doctorUpdate.mock.calls[0]?.[0] ?? {};
      expect(updatePayload.alpha_welcomed_at).toBeUndefined();
    } finally {
      (PRO_WHITELIST as unknown as string[]).pop();
    }
  });
});

describe("checkConsultationLimit", () => {
  beforeEach(() => {
    vi.mocked(createClient).mockReset();
  });

  it("allows unlimited when subscription plan='pro' and status='active'", async () => {
    const { supabase } = makeSupabaseRouted({
      subscription: { plan: "pro", status: "active" },
      consultationCount: 9999,
    });
    vi.mocked(createClient).mockResolvedValue(supabase as any);
    const result = await checkConsultationLimit("doctor-1");
    expect(result.allowed).toBe(true);
    expect(result.plan).toBe("pro");
    expect(result.limit).toBe(Infinity);
  });

  it("allows unlimited when subscription plan='pro' and status='whitelisted'", async () => {
    const { supabase } = makeSupabaseRouted({
      subscription: { plan: "pro", status: "whitelisted" },
      consultationCount: 9999,
    });
    vi.mocked(createClient).mockResolvedValue(supabase as any);
    const result = await checkConsultationLimit("doctor-1");
    expect(result.allowed).toBe(true);
    expect(result.plan).toBe("pro");
    expect(result.limit).toBe(Infinity);
  });

  it("allows a free doctor below the monthly cap", async () => {
    const { supabase } = makeSupabaseRouted({
      subscription: { plan: "free", status: "active" },
      consultationCount: 5,
    });
    vi.mocked(createClient).mockResolvedValue(supabase as any);
    const result = await checkConsultationLimit("doctor-2");
    expect(result.allowed).toBe(true);
    expect(result.plan).toBe("free");
    expect(result.limit).toBe(FREE_TIER_CONSULTATION_LIMIT);
    expect(result.used).toBe(5);
  });

  it("blocks a free doctor at the monthly cap", async () => {
    const { supabase } = makeSupabaseRouted({
      subscription: { plan: "free", status: "active" },
      consultationCount: FREE_TIER_CONSULTATION_LIMIT,
    });
    vi.mocked(createClient).mockResolvedValue(supabase as any);
    const result = await checkConsultationLimit("doctor-3");
    expect(result.allowed).toBe(false);
    expect(result.used).toBe(FREE_TIER_CONSULTATION_LIMIT);
  });

  it("defaults missing subscription to free plan", async () => {
    const { supabase } = makeSupabaseRouted({
      subscription: null,
      consultationCount: 21,
    });
    vi.mocked(createClient).mockResolvedValue(supabase as any);
    const result = await checkConsultationLimit("doctor-4");
    expect(result.plan).toBe("free");
    expect(result.allowed).toBe(false);
  });
});

describe("getMonthlyConsultationCount", () => {
  beforeEach(() => {
    vi.mocked(createClient).mockReset();
  });

  it("queries larinova_consultations filtered by doctor_id and start-of-month", async () => {
    const { supabase, from, builder } = makeSupabaseWithCount(7);
    vi.mocked(createClient).mockResolvedValue(supabase as any);

    const count = await getMonthlyConsultationCount(
      "doctor-uuid-1",
      new Date(Date.UTC(2026, 3, 23, 0, 0, 0)),
    );

    expect(count).toBe(7);
    expect(from).toHaveBeenCalledWith("larinova_consultations");
    expect(builder._filters).toContainEqual({
      field: "doctor_id",
      value: "doctor-uuid-1",
    });
    expect(builder._filters).toContainEqual({
      field: "created_at",
      value: "2026-04-01T00:00:00.000Z",
    });
  });

  it("returns 0 when supabase returns null count", async () => {
    const { supabase } = makeSupabaseWithCount(null as unknown as number);
    vi.mocked(createClient).mockResolvedValue(supabase as any);

    const count = await getMonthlyConsultationCount("doctor-x");
    expect(count).toBe(0);
  });
});
