import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendSms } from "./sms";
import type { Recipient } from "./types";

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv };
  process.env.MSG91_AUTH_KEY = "auth";
  process.env.MSG91_SENDER_ID = "LARINV";
  process.env.MSG91_DLT_TEMPLATE_IDS = JSON.stringify({
    appointment_confirmation: "tmpl_123",
  });
});
afterEach(() => {
  process.env = originalEnv;
  vi.restoreAllMocks();
});

describe("sendSms", () => {
  it("posts to MSG91 flow endpoint with auth header + template id", async () => {
    const fetchMock = vi.fn(async (url, init) => {
      expect(String(url)).toBe("https://control.msg91.com/api/v5/flow");
      const body = JSON.parse(init!.body as string);
      expect(body.template_id).toBe("tmpl_123");
      expect(body.sender).toBe("LARINV");
      expect(body.recipients[0].mobiles).toBe("919812345678");
      const headers = init?.headers as Record<string, string>;
      expect(headers.authkey).toBe("auth");
      return new Response(
        JSON.stringify({ type: "success", message: "rid_abc" }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const recipient: Recipient = { phone: "+91 98123 45678" };
    const res = await sendSms(
      { body: "dummy" },
      recipient,
      "appointment_confirmation",
    );
    expect(res.status).toBe("sent");
    expect(res.providerMsgId).toBe("rid_abc");
  });

  it("throws when DLT template id is missing", async () => {
    process.env.MSG91_DLT_TEMPLATE_IDS = JSON.stringify({});
    await expect(
      sendSms({ body: "x" }, { phone: "+919812345678" }, "welcome_alpha"),
    ).rejects.toThrow(/DLT template id missing/);
  });

  it("throws when keys are missing", async () => {
    delete process.env.MSG91_AUTH_KEY;
    await expect(
      sendSms(
        { body: "x" },
        { phone: "+919812345678" },
        "appointment_confirmation",
      ),
    ).rejects.toThrow(/MSG91_AUTH_KEY/);
  });
});
