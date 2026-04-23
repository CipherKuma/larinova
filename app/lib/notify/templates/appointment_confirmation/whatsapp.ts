import type { RenderedTemplate, TemplateFn } from "../../types";
import type { AppointmentConfirmationData } from "./email";

const render: TemplateFn<AppointmentConfirmationData> = (
  data,
): RenderedTemplate => {
  const kind =
    data.appointmentType === "video" ? "Video consult" : "In-person visit";
  const link =
    data.appointmentType === "video" && data.videoCallLink
      ? `\nJoin: ${data.videoCallLink}`
      : "";
  const portal = data.portalUrl ? `\nManage: ${data.portalUrl}` : "";
  return {
    body: `Hi ${data.patientName}, your ${kind} with Dr. ${data.doctorName} is confirmed for ${data.appointmentDate} at ${data.startTime}.${link}${portal}\n\nReply STOP to opt out of reminders.`,
  };
};

export default render;
