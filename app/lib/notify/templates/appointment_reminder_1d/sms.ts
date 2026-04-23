import type { RenderedTemplate, TemplateFn } from "../../types";
import type { AppointmentReminder1dData } from "./email";

const render: TemplateFn<AppointmentReminder1dData> = (
  data,
): RenderedTemplate => ({
  body: `Larinova reminder: your appointment with Dr. ${data.doctorName} is tomorrow ${data.appointmentDate} at ${data.startTime}. Reply STOP to opt out.`,
});

export default render;
