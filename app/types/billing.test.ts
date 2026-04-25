import { describe, it, expect } from "vitest";
import { PLAN_PRICES, FREE_TIER_CONSULTATION_LIMIT } from "./billing";

describe("PLAN_PRICES", () => {
  it("includes an India (INR) row at ₹1,500/month and ₹15,000/year", () => {
    expect(PLAN_PRICES.IN.currency).toBe("INR");
    expect(PLAN_PRICES.IN.symbol).toBe("₹");
    expect(PLAN_PRICES.IN.month.amount).toBe(150000);
    expect(PLAN_PRICES.IN.month.label).toBe("₹1,500/month");
    expect(PLAN_PRICES.IN.year.amount).toBe(1500000);
    expect(PLAN_PRICES.IN.year.label).toBe("₹15,000/year");
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
