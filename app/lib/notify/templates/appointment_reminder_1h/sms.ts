import type { RenderedTemplate, TemplateFn } from "../../types";

export interface AppointmentReminder1hData {
  patientName: string;
  doctorName: string;
  startTime: string;
  clinicName?: string;
  videoCallLink?: string;
  appointmentType: "video" | "in_person";
}

const render: TemplateFn<AppointmentReminder1hData> = (
  data,
): RenderedTemplate => ({
  body: `Larinova: Your appointment with Dr. ${data.doctorName} is in 1 hour (${data.startTime}). ${
    data.appointmentType === "video"
      ? "Video call link in WhatsApp."
      : "See you at the clinic."
  }`,
});

export default render;
