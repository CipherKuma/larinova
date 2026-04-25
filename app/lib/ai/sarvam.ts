/**
 * Sarvam chat-completion client.
 *
 * Single canonical AI inference path for the app: agents (intake, dispatcher,
 * wellness, narrative), Helena, SOAP/medical-codes/summary/diarize/prescription
 * routes, and the simulate-* scripts all funnel through here. Replaces
 * lib/ai/claude.ts (kept on disk but no longer imported — see that file's header).
 *
 * Two entry points:
 *   chatSync({ prompt, systemPrompt? })       — drop-in for the old Claude
 *                                                shape; one user message,
 *                                                optional system prompt.
 *   chatSyncMessages({ messages })            — full conversational form;
 *                                                used by Helena to thread
 *                                                history through.
 *
 * Sarvam-m emits a <think>…</think> block before its final answer; we strip
 * it server-side so callers always see clean output. Use reasoningEffort:"low"
 * by default — that keeps latency in the 1–6s range while still giving the
 * model enough budget to think for medical reasoning.
 */

const SARVAM_BASE_URL = "https://api.sarvam.ai/v1";
const DEFAULT_MODEL = "sarvam-m";
const DEFAULT_MAX_TOKENS = 2000;
const DEFAULT_REASONING_EFFORT: "low" | "medium" | "high" = "low";

export type SarvamModel = "sarvam-m" | "sarvam-30b" | "sarvam-105b";

/**
 * Accepts the legacy Claude model names ("sonnet", "opus", "haiku") used by
 * older callsites and silently maps them to sarvam-m. New code should pass a
 * SarvamModel directly.
 */
type ModelInput = SarvamModel | "sonnet" | "opus" | "haiku" | (string & {});

function resolveModel(m: ModelInput | undefined): SarvamModel {
  if (m === "sarvam-30b") return "sarvam-30b";
  if (m === "sarvam-105b") return "sarvam-105b";
  return "sarvam-m";
}

export type SarvamMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface SarvamChatInput {
  prompt: string;
  systemPrompt?: string;
  model?: ModelInput;
  maxTokens?: number;
  reasoningEffort?: "low" | "medium" | "high";
  signal?: AbortSignal;
}

export interface SarvamChatMessagesInput {
  messages: SarvamMessage[];
  model?: ModelInput;
  maxTokens?: number;
  reasoningEffort?: "low" | "medium" | "high";
  signal?: AbortSignal;
}

export interface SarvamChatResult {
  text: string;
  rawText: string;
  model: SarvamModel;
  finishReason: string;
  promptTokens: number;
  completionTokens: number;
}

export class SarvamServiceError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(`sarvam ${status}: ${body.slice(0, 500)}`);
    this.name = "SarvamServiceError";
    this.status = status;
    this.body = body;
  }
}

function getApiKey(): string {
  const key = process.env.SARVAM_API_KEY;
  if (!key) throw new Error("SARVAM_API_KEY not configured");
  return key;
}

function stripReasoning(s: string): string {
  return s.replace(/<think>[\s\S]*?<\/think>\s*/g, "").trim();
}

async function callSarvam(
  messages: SarvamMessage[],
  opts: {
    model?: ModelInput;
    maxTokens?: number;
    reasoningEffort?: "low" | "medium" | "high";
    signal?: AbortSignal;
  },
): Promise<SarvamChatResult> {
  const model: SarvamModel = resolveModel(opts.model) ?? DEFAULT_MODEL;
  const body = {
    model,
    messages,
    max_completion_tokens: opts.maxTokens ?? DEFAULT_MAX_TOKENS,
    reasoning_effort: opts.reasoningEffort ?? DEFAULT_REASONING_EFFORT,
  };

  const res = await fetch(`${SARVAM_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(body),
    signal: opts.signal,
  });

  if (!res.ok) {
    throw new SarvamServiceError(res.status, await res.text().catch(() => ""));
  }

  const data = (await res.json()) as {
    choices?: Array<{
      finish_reason?: string;
      message?: { content?: string | null };
    }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const choice = data.choices?.[0];
  const rawText = choice?.message?.content ?? "";
  return {
    text: stripReasoning(rawText),
    rawText,
    model,
    finishReason: choice?.finish_reason ?? "unknown",
    promptTokens: data.usage?.prompt_tokens ?? 0,
    completionTokens: data.usage?.completion_tokens ?? 0,
  };
}

/**
 * One-shot prompt with optional system prompt — drop-in replacement for the
 * old `chatSync` from lib/ai/claude.ts. Suitable for SOAP rewrites, narrative
 * generation, structured JSON extraction.
 */
export async function chatSync(
  input: SarvamChatInput,
): Promise<SarvamChatResult> {
  const messages: SarvamMessage[] = [];
  if (input.systemPrompt) {
    messages.push({ role: "system", content: input.systemPrompt });
  }
  messages.push({ role: "user", content: input.prompt });
  return callSarvam(messages, input);
}

/**
 * Full conversational form. Used by Helena to thread saved history.
 */
export async function chatSyncMessages(
  input: SarvamChatMessagesInput,
): Promise<SarvamChatResult> {
  return callSarvam(input.messages, input);
}

/**
 * Tolerant JSON extraction: unwraps ```json fences, finds the first balanced
 * {...} block when the model added prose. Throws if no JSON is found.
 *
 * Identical contract to the old extractJson from lib/ai/claude.ts so callers
 * can swap imports without touching parsing logic.
 */
export function extractJson<T = unknown>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("no JSON object found in sarvam response");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}
