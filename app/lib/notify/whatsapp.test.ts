import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendWhatsapp } from "./whatsapp";

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv };
  process.env.GUPSHUP_API_KEY = "gkey";
  process.env.GUPSHUP_APP_NAME = "larinova";
  process.env.GUPSHUP_SOURCE_NUMBER = "+919876543210";
});
afterEach(() => {
  process.env = originalEnv;
  vi.restoreAllMocks();
});

describe("sendWhatsapp", () => {
  it("posts form-encoded body to Gupshup with apikey header", async () => {
    const fetchMock = vi.fn(async (url, init) => {
      expect(String(url)).toBe("https://api.gupshup.io/wa/api/v1/msg");
      expect((init?.headers as Record<string, string>).apikey).toBe("gkey");
      const body = init!.body as string;
      expect(body).toContain("channel=whatsapp");
      expect(body).toContain("source=919876543210");
      expect(body).toContain("destination=919812345678");
      return new Response(
        JSON.stringify({ status: "submitted", messageId: "gs_1" }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await sendWhatsapp(
      { body: "Hello!" },
      { whatsapp: "+919812345678" },
    );
    expect(res.status).toBe("sent");
    expect(res.providerMsgId).toBe("gs_1");
  });

  it("falls back to recipient.phone when .whatsapp is unset", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ status: "submitted", messageId: "gs_2" }),
          {
            status: 200,
          },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const res = await sendWhatsapp({ body: "x" }, { phone: "+919812345678" });
    expect(res.status).toBe("sent");
    expect(fetchMock).toHaveBeenCalled();
  });

  it("throws when no destination is provided", async () => {
    await expect(sendWhatsapp({ body: "x" }, {})).rejects.toThrow();
  });
});
