import type { RenderedTemplate, TemplateFn } from "../../types";
import { emailShell, escHtml } from "../shared";

export interface AppointmentReminder1dData {
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  startTime: string;
  portalUrl?: string;
  rescheduleUrl?: string;
}

const render: TemplateFn<AppointmentReminder1dData> = (
  data,
): RenderedTemplate => {
  const inner = `
    <p>Hi ${escHtml(data.patientName)},</p>
    <p>This is a reminder: your appointment with <strong>Dr. ${escHtml(data.doctorName)}</strong> is tomorrow, <strong>${escHtml(data.appointmentDate)}</strong> at <strong>${escHtml(data.startTime)}</strong>.</p>
    <p>If anything's changed, you can reschedule or cancel any time.</p>
    ${data.rescheduleUrl ? `<p><a href="${escHtml(data.rescheduleUrl)}" style="display:inline-block;margin-top:4px;padding:9px 16px;background:#f5f5f5;color:#111;border-radius:6px;text-decoration:none;">Reschedule</a></p>` : ""}
  `;
  return {
    subject: `Reminder: appointment with Dr. ${data.doctorName} tomorrow`,
    body: emailShell("Appointment Reminder — Tomorrow", inner),
  };
};

export default render;
