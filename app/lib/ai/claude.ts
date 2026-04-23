/**
 * Claude Service client — per ~/.claude/rules/claude-service.md every AI
 * inference must go through https://claude.fierypools.fun, never the direct
 * Anthropic SDK. The service accepts a `prompt` string and streams NDJSON
 * `claude_event` lines; we parse those into a single assistant response.
 */

export type ClaudeModel = "sonnet" | "opus";

export interface ClaudeChatInput {
  prompt: string;
  model?: ClaudeModel;
  maxTurns?: number;
  workingDirectory?: string;
  signal?: AbortSignal;
}

export interface ClaudeChatResult {
  text: string;
  model: ClaudeModel;
  raw: string;
}

export class ClaudeServiceError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(`claude-service ${status}: ${body.slice(0, 500)}`);
    this.name = "ClaudeServiceError";
    this.status = status;
    this.body = body;
  }
}

function getServiceUrl(): string {
  return process.env.CLAUDE_SERVICE_URL || "https://claude.fierypools.fun";
}

function getServiceKey(): string {
  return process.env.CLAUDE_SERVICE_API_KEY || "";
}

/**
 * Send a one-shot prompt and collect the full assistant response.
 * Suitable for structured JSON outputs, SOAP rewrites, narrative generation.
 */
export async function chatSync(
  input: ClaudeChatInput,
): Promise<ClaudeChatResult> {
  const model = input.model ?? "sonnet";
  const res = await fetch(`${getServiceUrl()}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": getServiceKey(),
    },
    body: JSON.stringify({
      prompt: input.prompt,
      model,
      maxTurns: input.maxTurns ?? 1,
      workingDirectory: input.workingDirectory ?? "/tmp",
    }),
    signal: input.signal,
  });

  if (!res.ok) {
    throw new ClaudeServiceError(res.status, await res.text());
  }

  const raw = await res.text();
  const text = parseClaudeNdjson(raw);
  return { text, model, raw };
}

/**
 * Parse NDJSON stream from Claude Service. Handles two shapes emitted by
 * the proxy: (a) full assistant message with a content array, (b) streaming
 * content_block_delta with text_delta chunks. Silently skips malformed lines.
 */
export function parseClaudeNdjson(raw: string): string {
  let out = "";
  const lines = raw.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let event: unknown;
    try {
      event = JSON.parse(trimmed);
    } catch {
      continue;
    }
    if (!isClaudeEvent(event)) continue;
    const data = event.data;
    if (!data || typeof data !== "object") continue;

    const rec = data as Record<string, unknown>;

    if (rec.type === "assistant") {
      const msg = rec.message as Record<string, unknown> | undefined;
      const content = msg?.content;
      if (Array.isArray(content)) {
        for (const block of content) {
          if (
            block &&
            typeof block === "object" &&
            (block as { type?: string }).type === "text" &&
            typeof (block as { text?: unknown }).text === "string"
          ) {
            out += (block as { text: string }).text;
          }
        }
      }
    }

    if (rec.type === "content_block_delta") {
      const delta = rec.delta as Record<string, unknown> | undefined;
      if (
        delta &&
        delta.type === "text_delta" &&
        typeof delta.text === "string"
      ) {
        out += delta.text;
      }
    }
  }
  return out;
}

function isClaudeEvent(
  x: unknown,
): x is { type: string; data: Record<string, unknown> } {
  return (
    !!x &&
    typeof x === "object" &&
    (x as { type?: unknown }).type === "claude_event"
  );
}

/**
 * Parse a JSON object from Claude's response. Tolerant: unwraps ```json fences,
 * extracts the first {...} block if the model added prose. Throws if no JSON
 * is found.
 */
export function extractJson<T = unknown>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("no JSON object found in claude response");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}
