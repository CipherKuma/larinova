import type { Recipient, RenderedTemplate, SendResult } from "./types";

/**
 * MSG91 Flow API — https://docs.msg91.com/reference/send-sms
 * POST https://control.msg91.com/api/v5/flow
 *
 * DLT-compliant: every template must be pre-approved in the MSG91 dashboard
 * and registered as an entry in MSG91_DLT_TEMPLATE_IDS (JSON object keyed by
 * template_key). If the key is missing, we mark the row failed with a clear
 * error instead of blowing up the whole notify() call.
 */

const MSG91_ENDPOINT = "https://control.msg91.com/api/v5/flow";

function getDltTemplateIds(): Record<string, string> {
  const raw = process.env.MSG91_DLT_TEMPLATE_IDS;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function normalisePhone(e164: string): string {
  // MSG91 expects the number with country code, no leading '+'.
  return e164.replace(/^\+/, "").replace(/\s/g, "");
}

export async function sendSms(
  rendered: RenderedTemplate,
  recipient: Recipient,
  templateKey: string,
  variables: Record<string, string> = {},
): Promise<SendResult> {
  if (!recipient.phone) {
    throw new Error("sms recipient requires .phone");
  }

  const authKey = process.env.MSG91_AUTH_KEY;
  const senderId = process.env.MSG91_SENDER_ID;
  const templateId = getDltTemplateIds()[templateKey];

  if (!authKey || !senderId) {
    throw new Error("MSG91_AUTH_KEY / MSG91_SENDER_ID not configured");
  }
  if (!templateId) {
    throw new Error(`MSG91 DLT template id missing for '${templateKey}'`);
  }

  const body = {
    template_id: templateId,
    sender: senderId,
    short_url: "0",
    recipients: [
      {
        mobiles: normalisePhone(recipient.phone),
        ...variables,
      },
    ],
  };

  const res = await fetch(MSG91_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      authkey: authKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`msg91 ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }

  const json = (await res.json()) as { message?: string; type?: string };
  // Success payload looks like { message: "<id>", type: "success" }
  const providerMsgId = typeof json.message === "string" ? json.message : null;
  return { providerMsgId, status: "sent" };
}

export function isSmsConfigured(): boolean {
  return (
    !!process.env.MSG91_AUTH_KEY &&
    !!process.env.MSG91_SENDER_ID &&
    !!process.env.MSG91_DLT_TEMPLATE_IDS
  );
}
