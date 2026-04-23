/**
 * Unified notifications module. Single entrypoint `notify(channel, key, data, recipient)`.
 *
 * Order of operations, per spec §5.7:
 *   1. Resolve template via registry → render body.
 *   2. Insert `larinova_messages` row with status='queued'.
 *   3. If SIMULATE_NOTIFY=1, short-circuit through simulate.ts and mark 'simulated'.
 *   4. Otherwise call channel provider (resend / msg91 / gupshup).
 *   5. Update the row with providerMsgId + status ('sent' or 'failed' + error).
 *
 * On provider misconfiguration (e.g. missing MSG91 keys) we write a 'failed' row
 * and return the NotifyResult — we never throw to the agent. This keeps the
 * Inngest function running so the caller can log and move on.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "./email";
import { sendSms } from "./sms";
import { sendWhatsapp } from "./whatsapp";
import { isSimulated, simulateSend } from "./simulate";
import { renderTemplate, type TemplateKey } from "./templates";
import type {
  Channel,
  NotifyOptions,
  NotifyResult,
  Recipient,
  RenderedTemplate,
  SendResult,
} from "./types";

export type { TemplateKey } from "./templates";
export type {
  Channel,
  NotifyResult,
  NotifyOptions,
  Recipient,
  Attachment,
  RenderedTemplate,
  TemplateFn,
  MessageStatus,
  Locale,
} from "./types";

export async function notify<TData = unknown>(
  channel: Channel,
  templateKey: TemplateKey,
  data: TData,
  recipient: Recipient,
  options: NotifyOptions = {},
): Promise<NotifyResult> {
  const locale = options.locale ?? recipient.locale ?? "in";
  const rendered = renderTemplate(templateKey, channel, data, locale);

  const messageId = await insertQueuedMessage({
    channel,
    templateKey,
    rendered,
    recipient,
    options,
    locale,
  });

  // Simulation short-circuit (used by agents + tests).
  if (isSimulated()) {
    const sim = simulateSend(channel, rendered, recipient, templateKey);
    await updateMessageStatus(messageId, {
      provider: `simulated:${channel}`,
      providerMsgId: sim.providerMsgId,
      status: "simulated",
      sentAt: new Date().toISOString(),
    });
    return {
      messageId,
      providerMsgId: sim.providerMsgId,
      status: "simulated",
      simulated: true,
    };
  }

  // In-app notifications: the database row IS the delivery. No external send.
  if (channel === "in_app") {
    await updateMessageStatus(messageId, {
      provider: "in_app",
      providerMsgId: null,
      status: "delivered",
      sentAt: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
    });
    return { messageId, providerMsgId: null, status: "delivered" };
  }

  try {
    const result = await dispatch(channel, rendered, recipient, templateKey);
    await updateMessageStatus(messageId, {
      provider: providerFor(channel),
      providerMsgId: result.providerMsgId,
      status: result.status,
      sentAt: new Date().toISOString(),
    });
    return {
      messageId,
      providerMsgId: result.providerMsgId,
      status: result.status,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    await updateMessageStatus(messageId, {
      provider: providerFor(channel),
      providerMsgId: null,
      status: "failed",
      error,
    });
    return { messageId, providerMsgId: null, status: "failed", error };
  }
}

function providerFor(channel: Channel): string {
  switch (channel) {
    case "email":
      return "resend";
    case "sms":
      return "msg91";
    case "whatsapp":
      return "gupshup";
    case "in_app":
      return "in_app";
  }
}

async function dispatch(
  channel: Channel,
  rendered: RenderedTemplate,
  recipient: Recipient,
  templateKey: TemplateKey,
): Promise<SendResult> {
  switch (channel) {
    case "email":
      return sendEmail(rendered, recipient);
    case "sms":
      return sendSms(rendered, recipient, templateKey);
    case "whatsapp":
      return sendWhatsapp(rendered, recipient);
    case "in_app":
      return { providerMsgId: null, status: "delivered" };
  }
}

interface InsertArgs {
  channel: Channel;
  templateKey: TemplateKey;
  rendered: RenderedTemplate;
  recipient: Recipient;
  options: NotifyOptions;
  locale: "in" | "id";
}

async function insertQueuedMessage(args: InsertArgs): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("larinova_messages")
    .insert({
      patient_id: args.recipient.patientId ?? null,
      doctor_id: args.recipient.doctorId ?? null,
      channel: args.channel,
      direction: "out",
      template_key: args.templateKey,
      subject: args.rendered.subject ?? null,
      body: args.rendered.body,
      related_entity_type: args.options.relatedEntityType ?? null,
      related_entity_id: args.options.relatedEntityId ?? null,
      recipient_email: args.recipient.email ?? null,
      recipient_phone:
        args.channel === "whatsapp"
          ? (args.recipient.whatsapp ?? args.recipient.phone ?? null)
          : (args.recipient.phone ?? null),
      status: "queued",
      locale: args.locale,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      `notify: insert larinova_messages failed: ${error?.message ?? "unknown"}`,
    );
  }
  return data.id as string;
}

interface UpdateArgs {
  provider?: string;
  providerMsgId?: string | null;
  status: string;
  error?: string;
  sentAt?: string;
  deliveredAt?: string;
}

async function updateMessageStatus(
  messageId: string,
  args: UpdateArgs,
): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("larinova_messages")
    .update({
      provider: args.provider,
      provider_msg_id: args.providerMsgId ?? null,
      status: args.status,
      error: args.error ?? null,
      sent_at: args.sentAt ?? null,
      delivered_at: args.deliveredAt ?? null,
    })
    .eq("id", messageId);
}
