import type { RenderedTemplate, TemplateFn } from "../../types";
import type { AppointmentReminder1dData } from "./email";

const render: TemplateFn<AppointmentReminder1dData> = (
  data,
): RenderedTemplate => ({
  body: `Hi ${data.patientName}, quick reminder — your appointment with Dr. ${data.doctorName} is tomorrow (${data.appointmentDate}) at ${data.startTime}.${
    data.rescheduleUrl ? `\nReschedule: ${data.rescheduleUrl}` : ""
  }\n\nReply STOP to opt out.`,
});

export default render;
