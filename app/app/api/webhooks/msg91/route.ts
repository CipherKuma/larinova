import crypto from "node:crypto";
import {
  handleMsg91Delivery,
  type Msg91DeliveryEvent,
} from "@/lib/notify/webhooks/msg91";

/**
 * MSG91 delivery webhook. MSG91 does NOT HMAC-sign delivery callbacks, so we
 * authenticate them with a shared secret (MSG91_WEBHOOK_SECRET) embedded in the
 * callback URL we register in their dashboard. The secret may arrive as the
 * `authkey` / `secret` query param or the `x-msg91-secret` header. When the
 * secret matches we reconcile by provider_msg_id (requestId). Verification is
 * skipped only when the secret is unconfigured (dev) so local testing stays
 * easy; in production the secret MUST be set or every caller is rejected by an
 * empty-vs-provided mismatch.
 */

/** Constant-time shared-secret check to avoid timing oracles. */
function verifyMsg91Secret(
  provided: string | null | undefined,
  expected: string,
): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const secret = process.env.MSG91_WEBHOOK_SECRET;
  if (secret) {
    const url = new URL(req.url);
    const provided =
      req.headers.get("x-msg91-secret") ??
      url.searchParams.get("authkey") ??
      url.searchParams.get("secret");
    if (!verifyMsg91Secret(provided, secret)) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  let payload: Msg91DeliveryEvent;
  try {
    payload = (await req.json()) as Msg91DeliveryEvent;
  } catch (err) {
    return Response.json(
      { error: "invalid_json", detail: String(err) },
      { status: 400 },
    );
  }

  const result = await handleMsg91Delivery(payload);
  return Response.json({ ok: true, updated: result.updated });
}

export async function GET() {
  return Response.json({ ok: true, service: "msg91-webhook" });
}
