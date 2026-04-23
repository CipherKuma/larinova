import { createAdminClient } from "@/lib/supabase/admin";

/**
 * MSG91 delivery webhook payload (simplified — they deliver a JSON blob
 * similar to: { requestId, data: [{ mobile, status, description, ... }] }).
 * We look up larinova_messages by provider_msg_id and update status.
 */

export interface Msg91DeliveryEvent {
  requestId?: string;
  data?: Array<{
    mobile?: string;
    status?: string;
    description?: string;
    event?: string;
    date?: string;
  }>;
  /** Some callbacks use a flat shape instead of `data[]`. */
  status?: string;
  recipientId?: string;
}

export async function handleMsg91Delivery(
  payload: Msg91DeliveryEvent,
): Promise<{ updated: number }> {
  const supabase = createAdminClient();
  const events = payload.data?.length
    ? payload.data
    : [{ status: payload.status }];
  let updated = 0;

  for (const evt of events) {
    const providerMsgId = payload.requestId;
    if (!providerMsgId) continue;

    const status = mapStatus(evt.status);
    if (!status) continue;

    const { error } = await supabase
      .from("larinova_messages")
      .update({
        status,
        delivered_at:
          status === "delivered" ? new Date().toISOString() : undefined,
        error: evt.description ?? null,
      })
      .eq("provider_msg_id", providerMsgId)
      .eq("provider", "msg91");

    if (!error) updated += 1;
  }
  return { updated };
}

function mapStatus(raw?: string): string | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (s.includes("delivered") || s === "1") return "delivered";
  if (s.includes("read")) return "read";
  if (s.includes("fail") || s.includes("reject") || s === "2") return "failed";
  if (s.includes("sent")) return "sent";
  return null;
}
