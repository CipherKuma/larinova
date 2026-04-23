/**
 * Shared types for the unified notifications module. Every channel + provider
 * speaks these shapes so `notify()` can remain a thin orchestrator.
 */

export type Channel = "email" | "sms" | "whatsapp" | "in_app";

export type Direction = "out" | "in";

export type MessageStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "replied"
  | "simulated";

export type Locale = "in" | "id";

export interface Recipient {
  patientId?: string;
  doctorId?: string;
  email?: string;
  /** E.164 phone number, e.g. +919812345678 */
  phone?: string;
  /** E.164 WhatsApp number; defaults to `phone` if unset. */
  whatsapp?: string;
  /** Display name used in salutations. */
  name?: string;
  /** Defaults to 'in' for India; templates fall back to 'in' if 'id' missing. */
  locale?: Locale;
}

export interface Attachment {
  filename: string;
  /** Base64-encoded content, without the `data:...;base64,` prefix. */
  content: string;
  contentType?: string;
}

export interface RenderedTemplate {
  subject?: string;
  /** Plain text or HTML body, depending on channel. */
  body: string;
  attachments?: Attachment[];
}

export interface NotifyOptions {
  /** Link back to the business entity that triggered this send. */
  relatedEntityType?: string;
  relatedEntityId?: string;
  /** Override the locale inferred from the recipient. */
  locale?: Locale;
  /** Idempotency hint for webhook reconciliation. */
  correlationId?: string;
}

export interface NotifyResult {
  messageId: string;
  providerMsgId: string | null;
  status: MessageStatus;
  error?: string;
  simulated?: boolean;
}

/**
 * Channel-specific send function signature. Providers implement this.
 * Return a providerMsgId + status on success, or throw on unrecoverable error.
 */
export interface SendResult {
  providerMsgId: string | null;
  status: MessageStatus;
}

/**
 * Shape every template file exports. `data` is template-specific; we rely
 * on the template's own input type for validation at the call site.
 */
export type TemplateFn<TData> = (
  data: TData,
  locale?: Locale,
) => RenderedTemplate;
