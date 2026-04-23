import { Resend } from "resend";
import type { Recipient, RenderedTemplate, SendResult } from "./types";

const FROM = process.env.EMAIL_FROM || "hello@larinova.com";

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendEmail(
  rendered: RenderedTemplate,
  recipient: Recipient,
): Promise<SendResult> {
  if (!recipient.email) {
    throw new Error("email recipient requires .email");
  }
  const client = getClient();
  if (!client) {
    return { providerMsgId: null, status: "failed" };
  }

  const { data, error } = await client.emails.send({
    from: FROM,
    to: recipient.email,
    subject: rendered.subject ?? "(no subject)",
    html: rendered.body,
    attachments: rendered.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
    })),
  });

  if (error) {
    throw new Error(`resend error: ${error.message ?? JSON.stringify(error)}`);
  }

  return {
    providerMsgId: data?.id ?? null,
    status: "sent",
  };
}

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}
