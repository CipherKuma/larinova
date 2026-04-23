import type { Recipient, RenderedTemplate, SendResult } from "./types";

/**
 * Gupshup WhatsApp Business outbound.
 * POST https://api.gupshup.io/wa/api/v1/msg
 * Content-Type: application/x-www-form-urlencoded
 * Headers: apikey
 *
 * v1: always sends the rendered body as a text message. WhatsApp templated
 * messages (with media attachments) are routed through the same endpoint
 * using message.type=image/document; we support that via optional
 * `attachments` passing the first attachment's URL in rendered.body.
 */

const GUPSHUP_ENDPOINT = "https://api.gupshup.io/wa/api/v1/msg";

function normalisePhone(e164: string): string {
  return e164.replace(/^\+/, "").replace(/\s/g, "");
}

export async function sendWhatsapp(
  rendered: RenderedTemplate,
  recipient: Recipient,
): Promise<SendResult> {
  const destination = recipient.whatsapp ?? recipient.phone;
  if (!destination) {
    throw new Error("whatsapp recipient requires .whatsapp or .phone");
  }

  const apiKey = process.env.GUPSHUP_API_KEY;
  const source = process.env.GUPSHUP_SOURCE_NUMBER;
  const appName = process.env.GUPSHUP_APP_NAME;
  if (!apiKey || !source) {
    throw new Error("GUPSHUP_API_KEY / GUPSHUP_SOURCE_NUMBER not configured");
  }

  const message = {
    type: "text",
    text: rendered.body,
  };

  const params = new URLSearchParams({
    channel: "whatsapp",
    source: normalisePhone(source),
    destination: normalisePhone(destination),
    message: JSON.stringify(message),
    "src.name": appName ?? "",
  });

  const res = await fetch(GUPSHUP_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      apikey: apiKey,
      accept: "application/json",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error(
      `gupshup ${res.status}: ${(await res.text()).slice(0, 200)}`,
    );
  }

  const json = (await res.json()) as {
    status?: string;
    messageId?: string;
    message?: string;
  };
  const providerMsgId = json.messageId ?? json.message ?? null;
  return { providerMsgId, status: "sent" };
}

export function isWhatsappConfigured(): boolean {
  return !!process.env.GUPSHUP_API_KEY && !!process.env.GUPSHUP_SOURCE_NUMBER;
}
