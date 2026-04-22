import { describe, it, expect } from "vitest";
import { PLAN_PRICES, FREE_TIER_CONSULTATION_LIMIT } from "./billing";

describe("PLAN_PRICES", () => {
  it("includes an Indonesia (IDR) row at Rp 299,000/month and Rp 2,990,000/year", () => {
    expect(PLAN_PRICES.ID.currency).toBe("IDR");
    expect(PLAN_PRICES.ID.symbol).toBe("Rp");
    expect(PLAN_PRICES.ID.month.amount).toBe(29900000);
    expect(PLAN_PRICES.ID.month.label).toBe("Rp 299,000/month");
    expect(PLAN_PRICES.ID.year.amount).toBe(299000000);
    expect(PLAN_PRICES.ID.year.label).toBe("Rp 2,990,000/year");
  });
});

describe("FREE_TIER_CONSULTATION_LIMIT", () => {
  it("is 20 consultations per month", () => {
    expect(FREE_TIER_CONSULTATION_LIMIT).toBe(20);
  });
});
