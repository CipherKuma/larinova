import { Inngest } from "inngest";

/**
 * Strongly-typed Inngest events for the OPD platform. Every new event must be
 * added here BEFORE any function can emit or subscribe. Inngest v4 dropped the
 * EventSchemas helper; we keep a `LarinovaEvents` record for editor-side
 * autocompletion + the `send()` wrapper below for type-checked emits.
 */

export type LarinovaEvents = {
  "appointment.booked": {
    data: { appointmentId: string; doctorId: string; patientId: string };
  };
  "intake.submitted": { data: { appointmentId: string } };
  "intake.info_requested": {
    data: { appointmentId: string; questions: string[] };
  };
  "intake.info_received": {
    data: { appointmentId: string; replyMessageId: string };
  };
  "intake.prep_ready": { data: { appointmentId: string } };
  "consultation.finalized": { data: { consultationId: string } };
  "followup.scheduled": {
    data: { threadId: string; tier: "day-1" | "day-3" | "day-7" };
  };
  "followup.message_received": { data: { threadId: string; body: string } };
  "followup.flagged": { data: { threadId: string } };
  "narrative.regenerate": { data: { patientId: string } };
  "payment.subscription_activated": { data: { doctorId: string } };
  "payment.subscription_failed": { data: { doctorId: string } };
  "whatsapp.message_received": {
    data: { phone: string; body: string; providerMsgId: string };
  };
  "sms.delivered": { data: { providerMsgId: string; status: string } };
};

export const inngest = new Inngest({
  id: "larinova",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

/**
 * Typed convenience wrapper around inngest.send — compile-time checks the
 * event name + data shape against LarinovaEvents.
 */
export async function sendEvent<K extends keyof LarinovaEvents>(
  name: K,
  data: LarinovaEvents[K]["data"],
): Promise<void> {
  await inngest.send({ name, data } as never);
}
