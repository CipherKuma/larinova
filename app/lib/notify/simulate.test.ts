import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isSimulated, simulateSend } from "./simulate";
import type { Recipient, RenderedTemplate } from "./types";

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv };
  delete process.env.SIMULATE_NOTIFY;
});
afterEach(() => {
  process.env = originalEnv;
  vi.restoreAllMocks();
});

describe("isSimulated", () => {
  it("defaults to false", () => {
    expect(isSimulated()).toBe(false);
  });
  it("is true when SIMULATE_NOTIFY=1", () => {
    process.env.SIMULATE_NOTIFY = "1";
    expect(isSimulated()).toBe(true);
  });
  it("is false for any other value", () => {
    process.env.SIMULATE_NOTIFY = "yes";
    expect(isSimulated()).toBe(false);
  });
});

describe("simulateSend", () => {
  it("logs to stdout and returns a sim_* providerMsgId with status=simulated", () => {
    const spy = vi.spyOn(process.stdout, "write").mockReturnValue(true);
    const rendered: RenderedTemplate = {
      subject: "Hi",
      body: "Hello Raj, your appointment is tomorrow.",
    };
    const recipient: Recipient = { email: "raj@example.com" };

    const result = simulateSend(
      "email",
      rendered,
      recipient,
      "appointment_reminder_1d",
    );

    expect(result.status).toBe("simulated");
    expect(result.providerMsgId).toMatch(/^sim_email_/);
    const calls = spy.mock.calls.map((c) => String(c[0])).join("");
    expect(calls).toContain("[SIMULATE_NOTIFY] EMAIL");
    expect(calls).toContain("raj@example.com");
    expect(calls).toContain("appointment_reminder_1d");
  });
});
