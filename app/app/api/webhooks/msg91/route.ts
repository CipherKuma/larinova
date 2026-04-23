import {
  handleMsg91Delivery,
  type Msg91DeliveryEvent,
} from "@/lib/notify/webhooks/msg91";

/**
 * MSG91 delivery webhook. MSG91 posts delivery updates unsigned on the
 * public endpoint we register in their dashboard. We trust the payload
 * shape and reconcile by provider_msg_id (requestId).
 */

export async function POST(req: Request) {
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
