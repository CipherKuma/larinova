/**
 * DISABLED — superseded by lib/ai/sarvam.ts.
 *
 * The Claude Service (claude.fierypools.fun) wraps the Claude Code CLI, which
 * spawns a full agent session per request — measured 11–60s end-to-end for
 * trivial prompts and frequent Vercel function timeouts. We swapped to Sarvam-m
 * via OpenAI-compatible chat completions: 1–6s, consistent, ~10x faster.
 *
 * This file is kept on disk as a reference (and so we can flip back if Sarvam
 * ever has an outage), but every callsite has been migrated to import from
 * `@/lib/ai/sarvam` instead. If something here is imported, the export throws
 * at runtime so we catch it loudly rather than silently falling back to the
 * slow path.
 *
 * Re-enabling: restore the implementation from git history (commit before the
 * sarvam-everywhere switch) and update callers to import from here again.
 */

const DISABLED_MSG =
  "lib/ai/claude.ts is disabled — import from @/lib/ai/sarvam instead";

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

export async function chatSync(
  _input: ClaudeChatInput,
): Promise<ClaudeChatResult> {
  throw new Error(DISABLED_MSG);
}

export function parseClaudeNdjson(_raw: string): string {
  throw new Error(DISABLED_MSG);
}

export function extractJson<T = unknown>(_text: string): T {
  throw new Error(DISABLED_MSG);
}
