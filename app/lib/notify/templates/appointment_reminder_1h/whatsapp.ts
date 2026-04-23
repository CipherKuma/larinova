import type { RenderedTemplate, TemplateFn } from "../../types";
import type { AppointmentReminder1hData } from "./sms";

const render: TemplateFn<AppointmentReminder1hData> = (
  data,
): RenderedTemplate => {
  const location =
    data.appointmentType === "video"
      ? data.videoCallLink
        ? `\nJoin: ${data.videoCallLink}`
        : "\nYour doctor will share the video link shortly."
      : data.clinicName
        ? `\nLocation: ${data.clinicName}`
        : "";
  return {
    body: `Hi ${data.patientName}, your appointment with Dr. ${data.doctorName} starts in 1 hour (${data.startTime}).${location}`,
  };
};

export default render;
