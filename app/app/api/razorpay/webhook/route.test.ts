import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import crypto from "crypto";

const mockFrom = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

vi.mock("next/headers", async () => {
  return {
    headers: async () => ({
      get: (key: string) => headerStore[key.toLowerCase()] ?? null,
    }),
  };
});

let headerStore: Record<string, string> = {};

const originalEnv = { ...process.env };

function setEnv() {
  process.env.RAZORPAY_KEY_ID = "rzp_test_abc";
  process.env.RAZORPAY_KEY_SECRET = "s";
  process.env.RAZORPAY_WEBHOOK_SECRET = "whsec_123";
  process.env.RAZORPAY_PLAN_ID_PRO_MONTHLY = "m";
  process.env.RAZORPAY_PLAN_ID_PRO_YEARLY = "y";
}

function resetEnv() {
  process.env = { ...originalEnv };
  delete process.env.RAZORPAY_KEY_ID;
  delete process.env.RAZORPAY_KEY_SECRET;
  delete process.env.RAZORPAY_WEBHOOK_SECRET;
  delete process.env.RAZORPAY_PLAN_ID_PRO_MONTHLY;
  delete process.env.RAZORPAY_PLAN_ID_PRO_YEARLY;
  delete process.env.SIMULATE_RAZORPAY;
}

beforeEach(() => {
  vi.clearAllMocks();
  resetEnv();
  headerStore = {};
});

afterEach(() => {
  process.env = originalEnv;
});

function sign(body: string) {
  return crypto.createHmac("sha256", "whsec_123").update(body).digest("hex");
}

function req(body: string) {
  return new Request("http://localhost/api/razorpay/webhook", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

type DoctorRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  user_id?: string | null;
};

/**
 * Table-scoped chainable mock. Each test can observe calls via the returned `captures` object.
 *
 * The webhook route (route.ts) reads three tables:
 *   - larinova_razorpay_events  (idempotency insert)
 *   - larinova_subscriptions    (find row by razorpay_subscription_id, update status/plan)
 *   - larinova_doctors          (resolve doctor for notify + analytics milestone grant)
 * A `doctorRow` opt drives the larinova_doctors lookups so the activated /
 * charged / payment-failed handlers run to completion instead of throwing.
 */
function buildSupabase(opts: {
  subscriptionRow?: unknown;
  eventInsertError?: { code?: string } | null;
  doctorRow?: DoctorRow | null;
}) {
  const captures = {
    eventInserts: [] as unknown[],
    subscriptionUpdates: [] as { update: unknown; where: unknown }[],
    // Every column-set the route selected from larinova_doctors, with the id
    // it filtered on — lets tests assert the doctor-grant path was exercised.
    doctorLookups: [] as { select: string; where: unknown }[],
  };

  mockFrom.mockImplementation((table: string) => {
    if (table === "larinova_razorpay_events") {
      return {
        insert: async (row: unknown) => {
          captures.eventInserts.push(row);
          return { data: null, error: opts.eventInsertError ?? null };
        },
      };
    }

    if (table === "larinova_subscriptions") {
      const chain = {
        select: () => chain,
        eq: (_col: string, val: unknown) => {
          chain._where = val;
          return chain;
        },
        maybeSingle: async () => ({
          data: opts.subscriptionRow ?? null,
          error: null,
        }),
        update: (update: unknown) => {
          return {
            eq: async (_col: string, where: unknown) => {
              captures.subscriptionUpdates.push({ update, where });
              return { data: null, error: null };
            },
          };
        },
        _where: undefined as unknown,
      };
      return chain;
    }

    if (table === "larinova_doctors") {
      const chain = {
        _select: "" as string,
        _where: undefined as unknown,
        select: (cols: string) => {
          chain._select = cols;
          return chain;
        },
        eq: (_col: string, val: unknown) => {
          chain._where = val;
          return chain;
        },
        maybeSingle: async () => {
          captures.doctorLookups.push({
            select: chain._select,
            where: chain._where,
          });
          return { data: opts.doctorRow ?? null, error: null };
        },
      };
      return chain;
    }

    throw new Error(`Unexpected table: ${table}`);
  });

  return captures;
}

function payload(event: string, subEntity: Record<string, unknown> = {}) {
  return JSON.stringify({
    event,
    payload: {
      subscription: {
        entity: {
          id: "sub_1",
          status: "active",
          current_end: 1700000000,
          notes: {},
          ...subEntity,
        },
      },
    },
  });
}

describe("POST /api/razorpay/webhook", () => {
  it("returns 503 when razorpay not configured", async () => {
    const { POST } = await import("./route");
    const res = await POST(req(payload("subscription.activated")));
    expect(res.status).toBe(503);
  });

  it("rejects a request without a signature header", async () => {
    setEnv();
    buildSupabase({});
    const { POST } = await import("./route");
    const body = payload("subscription.activated");
    const res = await POST(req(body));
    expect(res.status).toBe(400);
  });

  it("rejects a request with a bad signature", async () => {
    setEnv();
    buildSupabase({});
    headerStore["x-razorpay-signature"] = "deadbeef";
    headerStore["x-razorpay-event-id"] = "evt_1";
    const { POST } = await import("./route");
    const body = payload("subscription.activated");
    const res = await POST(req(body));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("invalid_signature");
  });

  it("handles subscription.activated — upserts plan=pro,status=active and grants via doctor lookup", async () => {
    setEnv();
    const captures = buildSupabase({
      subscriptionRow: {
        id: "row1",
        status: "active",
        plan: "free",
        razorpay_subscription_id: "sub_1",
        doctor_id: "d1",
      },
      doctorRow: {
        id: "d1",
        email: "doc@example.com",
        full_name: "Asha Rao",
        user_id: "u1",
      },
    });
    const body = payload("subscription.activated", {
      notes: { interval: "year" },
      current_end: 1800000000,
    });
    headerStore["x-razorpay-signature"] = sign(body);
    headerStore["x-razorpay-event-id"] = "evt_act_1";

    const { POST } = await import("./route");
    const res = await POST(req(body));
    expect(res.status).toBe(200);
    expect(captures.eventInserts).toHaveLength(1);
    expect(captures.subscriptionUpdates).toHaveLength(1);
    const update = captures.subscriptionUpdates[0].update as {
      plan: string;
      status: string;
      billing_interval: string;
      razorpay_subscription_id: string;
    };
    expect(update.plan).toBe("pro");
    expect(update.status).toBe("active");
    expect(update.billing_interval).toBe("year");
    expect(update.razorpay_subscription_id).toBe("sub_1");

    // Doctor-grant path: the route resolves the doctor (id, email, full_name)
    // for the activation notice, then looks up its user_id for the milestone.
    expect(captures.doctorLookups.length).toBeGreaterThan(0);
    expect(captures.doctorLookups.every((l) => l.where === "d1")).toBe(true);
    expect(captures.doctorLookups.some((l) => l.select.includes("email"))).toBe(
      true,
    );
    expect(
      captures.doctorLookups.some((l) => l.select.includes("user_id")),
    ).toBe(true);
  });

  it("handles subscription.charged — updates current_period_end and records milestone via doctor lookup", async () => {
    setEnv();
    const captures = buildSupabase({
      subscriptionRow: {
        id: "row1",
        status: "active",
        plan: "pro",
        razorpay_subscription_id: "sub_1",
        doctor_id: "d1",
      },
      doctorRow: {
        id: "d1",
        email: "doc@example.com",
        full_name: "Asha Rao",
        user_id: "u1",
      },
    });
    const body = payload("subscription.charged", { current_end: 1800000000 });
    headerStore["x-razorpay-signature"] = sign(body);
    headerStore["x-razorpay-event-id"] = "evt_ch_1";

    const { POST } = await import("./route");
    const res = await POST(req(body));
    expect(res.status).toBe(200);
    const u = captures.subscriptionUpdates[0].update as {
      status: string;
      current_period_end: string;
    };
    expect(u.status).toBe("active");
    expect(u.current_period_end).toBe(
      new Date(1800000000 * 1000).toISOString(),
    );

    // charged resolves the doctor and reads its user_id for the payment milestone.
    expect(
      captures.doctorLookups.some((l) => l.select.includes("user_id")),
    ).toBe(true);
    expect(captures.doctorLookups.every((l) => l.where === "d1")).toBe(true);
  });

  it("handles payment.failed — sets past_due and resolves doctor for the dunning email", async () => {
    setEnv();
    const captures = buildSupabase({
      subscriptionRow: {
        id: "row1",
        status: "active",
        plan: "pro",
        razorpay_subscription_id: "sub_1",
        doctor_id: "d1",
      },
      doctorRow: {
        id: "d1",
        email: "doc@example.com",
        full_name: "Asha Rao",
        user_id: "u1",
      },
    });
    const body = payload("payment.failed");
    headerStore["x-razorpay-signature"] = sign(body);
    headerStore["x-razorpay-event-id"] = "evt_f_1";

    const { POST } = await import("./route");
    const res = await POST(req(body));
    expect(res.status).toBe(200);
    const u = captures.subscriptionUpdates[0].update as { status: string };
    expect(u.status).toBe("past_due");

    // payment.failed resolves the doctor (id, email, full_name) to send the
    // payment-failed notice.
    expect(captures.doctorLookups.length).toBeGreaterThan(0);
    expect(captures.doctorLookups.some((l) => l.select.includes("email"))).toBe(
      true,
    );
    expect(captures.doctorLookups.every((l) => l.where === "d1")).toBe(true);
  });

  it("handles subscription.cancelled — sets canceled", async () => {
    setEnv();
    const captures = buildSupabase({
      subscriptionRow: {
        id: "row1",
        status: "active",
        plan: "pro",
        razorpay_subscription_id: "sub_1",
        doctor_id: "d1",
      },
    });
    const body = payload("subscription.cancelled");
    headerStore["x-razorpay-signature"] = sign(body);
    headerStore["x-razorpay-event-id"] = "evt_c_1";

    const { POST } = await import("./route");
    const res = await POST(req(body));
    expect(res.status).toBe(200);
    const u = captures.subscriptionUpdates[0].update as { status: string };
    expect(u.status).toBe("canceled");
  });

  it("is idempotent — duplicate event insert returns 200 without reprocessing", async () => {
    setEnv();
    const captures = buildSupabase({
      eventInsertError: { code: "23505" },
      subscriptionRow: {
        id: "row1",
        status: "active",
        plan: "pro",
        razorpay_subscription_id: "sub_1",
        doctor_id: "d1",
      },
    });
    const body = payload("subscription.activated");
    headerStore["x-razorpay-signature"] = sign(body);
    headerStore["x-razorpay-event-id"] = "evt_dup_1";

    const { POST } = await import("./route");
    const res = await POST(req(body));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.duplicate).toBe(true);
    expect(captures.subscriptionUpdates).toHaveLength(0);
  });

  it("ignores unknown events with 200", async () => {
    setEnv();
    const captures = buildSupabase({});
    const body = JSON.stringify({
      event: "payment.captured",
      payload: { payment: { entity: { id: "pay_x" } } },
    });
    headerStore["x-razorpay-signature"] = sign(body);
    headerStore["x-razorpay-event-id"] = "evt_u_1";

    const { POST } = await import("./route");
    const res = await POST(req(body));
    expect(res.status).toBe(200);
    expect(captures.subscriptionUpdates).toHaveLength(0);
  });
});
