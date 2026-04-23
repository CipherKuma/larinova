import type { RenderedTemplate, TemplateFn } from "../../types";
import type { AppointmentConfirmationData } from "./email";

const render: TemplateFn<AppointmentConfirmationData> = (
  data,
): RenderedTemplate => ({
  body: `Larinova: Your appointment with Dr. ${data.doctorName} is confirmed for ${data.appointmentDate} at ${data.startTime}. Reply STOP to opt out.`,
});

export default render;
