import { describe, it, expect } from "vitest";
import { PLAN_PRICES, FREE_TIER_CONSULTATION_LIMIT } from "./billing";

describe("PLAN_PRICES", () => {
  it("includes an India (INR) row at ₹999/month and ₹9,990/year", () => {
    expect(PLAN_PRICES.IN.currency).toBe("INR");
    expect(PLAN_PRICES.IN.symbol).toBe("₹");
    expect(PLAN_PRICES.IN.month.amount).toBe(99900);
    expect(PLAN_PRICES.IN.month.label).toBe("₹999/month");
    expect(PLAN_PRICES.IN.year.amount).toBe(999000);
    expect(PLAN_PRICES.IN.year.label).toBe("₹9,990/year");
  });

  it("includes a default (USD) row at $20/month and $200/year", () => {
    expect(PLAN_PRICES.default.currency).toBe("USD");
    expect(PLAN_PRICES.default.month.amount).toBe(2000);
    expect(PLAN_PRICES.default.year.amount).toBe(20000);
  });
});

describe("FREE_TIER_CONSULTATION_LIMIT", () => {
  it("is 20 consultations per month", () => {
    expect(FREE_TIER_CONSULTATION_LIMIT).toBe(20);
  });
});
