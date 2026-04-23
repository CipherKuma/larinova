import type { Channel, RenderedTemplate, Recipient, SendResult } from "./types";

/**
 * When SIMULATE_NOTIFY=1, every provider short-circuits through here. Agents,
 * simulation scripts, and tests depend on this flag — nothing is sent to real
 * email/SMS/WhatsApp infrastructure.
 */
export function isSimulated(): boolean {
  return process.env.SIMULATE_NOTIFY === "1";
}

export function simulateSend(
  channel: Channel,
  rendered: RenderedTemplate,
  recipient: Recipient,
  templateKey: string,
): SendResult {
  const address =
    channel === "email"
      ? recipient.email
      : channel === "whatsapp"
        ? (recipient.whatsapp ?? recipient.phone)
        : recipient.phone;

  const summary =
    rendered.body.length > 200
      ? `${rendered.body.slice(0, 200)}…`
      : rendered.body;

  process.stdout.write(
    `[SIMULATE_NOTIFY] ${channel.toUpperCase()} → ${address ?? "<no-address>"}\n` +
      `  template: ${templateKey}\n` +
      (rendered.subject ? `  subject: ${rendered.subject}\n` : "") +
      `  body: ${summary.replace(/\n/g, "\\n")}\n` +
      (rendered.attachments?.length
        ? `  attachments: ${rendered.attachments.map((a) => a.filename).join(", ")}\n`
        : ""),
  );

  return {
    providerMsgId: `sim_${channel}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    status: "simulated",
  };
}
