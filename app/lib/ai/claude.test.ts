import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  chatSync,
  parseClaudeNdjson,
  extractJson,
  ClaudeServiceError,
} from "./claude";

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv };
  process.env.CLAUDE_SERVICE_URL = "https://claude.test.local";
  process.env.CLAUDE_SERVICE_API_KEY = "test-key";
});

afterEach(() => {
  process.env = originalEnv;
  vi.restoreAllMocks();
});

describe("parseClaudeNdjson", () => {
  it("extracts text from an assistant message block", () => {
    const line = JSON.stringify({
      type: "claude_event",
      data: {
        type: "assistant",
        message: {
          content: [
            { type: "text", text: "Hello " },
            { type: "text", text: "world" },
          ],
        },
      },
    });
    expect(parseClaudeNdjson(line)).toBe("Hello world");
  });

  it("concatenates content_block_delta text_delta chunks", () => {
    const lines = [
      JSON.stringify({
        type: "claude_event",
        data: {
          type: "content_block_delta",
          delta: { type: "text_delta", text: "foo" },
        },
      }),
      JSON.stringify({
        type: "claude_event",
        data: {
          type: "content_block_delta",
          delta: { type: "text_delta", text: "bar" },
        },
      }),
    ].join("\n");
    expect(parseClaudeNdjson(lines)).toBe("foobar");
  });

  it("ignores malformed / non-claude lines", () => {
    const lines = [
      "not-json",
      JSON.stringify({ type: "other", data: {} }),
      JSON.stringify({
        type: "claude_event",
        data: {
          type: "assistant",
          message: { content: [{ type: "text", text: "ok" }] },
        },
      }),
    ].join("\n");
    expect(parseClaudeNdjson(lines)).toBe("ok");
  });
});

describe("extractJson", () => {
  it("parses a raw JSON object", () => {
    expect(extractJson<{ a: number }>('{"a":1}')).toEqual({ a: 1 });
  });

  it("unwraps ```json fences", () => {
    const text = 'Sure! Here is the data:\n```json\n{"ready": true}\n```\n';
    expect(extractJson<{ ready: boolean }>(text)).toEqual({ ready: true });
  });

  it("extracts embedded object from prose", () => {
    const text = 'The answer is {"ok":true, "q":[1,2]} as shown.';
    expect(extractJson(text)).toEqual({ ok: true, q: [1, 2] });
  });

  it("throws when no object present", () => {
    expect(() => extractJson("no object here")).toThrow();
  });
});

describe("chatSync", () => {
  it("POSTs to /chat with X-API-Key and parses NDJSON", async () => {
    const body = JSON.stringify({
      type: "claude_event",
      data: {
        type: "assistant",
        message: { content: [{ type: "text", text: "hi" }] },
      },
    });
    const fetchMock = vi.fn(async (url, init) => {
      expect(String(url)).toBe("https://claude.test.local/chat");
      expect(init?.headers).toMatchObject({ "X-API-Key": "test-key" });
      const parsed = JSON.parse(init!.body as string);
      expect(parsed.prompt).toBe("hello");
      expect(parsed.model).toBe("sonnet");
      return new Response(body, { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await chatSync({ prompt: "hello" });
    expect(res.text).toBe("hi");
    expect(res.model).toBe("sonnet");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("throws ClaudeServiceError on non-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("boom", { status: 503 })),
    );
    await expect(chatSync({ prompt: "x" })).rejects.toBeInstanceOf(
      ClaudeServiceError,
    );
  });
});
