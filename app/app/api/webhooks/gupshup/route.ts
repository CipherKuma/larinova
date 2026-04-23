import {
  handleGupshupEvent,
  verifyGupshupSignature,
  type GupshupInboundPayload,
} from "@/lib/notify/webhooks/gupshup";

/**
 * Gupshup WhatsApp webhook. Signed with HMAC-SHA256 over the raw body using
 * GUPSHUP_WEBHOOK_SECRET; delivered via the `x-gs-signature` header. Covers
 * inbound messages + delivery status events. Verification is skipped only
 * when the secret isn't configured (dev mode) to keep local testing easy.
 */

export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.GUPSHUP_WEBHOOK_SECRET;
  const signature =
    req.headers.get("x-gs-signature") ?? req.headers.get("X-Gs-Signature");

  if (secret && !verifyGupshupSignature(raw, signature, secret)) {
    return Response.json({ error: "bad_signature" }, { status: 401 });
  }

  let payload: GupshupInboundPayload;
  try {
    payload = JSON.parse(raw) as GupshupInboundPayload;
  } catch (err) {
    return Response.json(
      { error: "invalid_json", detail: String(err) },
      { status: 400 },
    );
  }

  const result = await handleGupshupEvent(payload);
  return Response.json({ ok: true, ...result });
}

export async function GET() {
  return Response.json({ ok: true, service: "gupshup-webhook" });
}
