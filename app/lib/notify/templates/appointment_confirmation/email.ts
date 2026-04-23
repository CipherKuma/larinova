import type { Locale, RenderedTemplate, TemplateFn } from "../../types";
import { emailShell, escHtml } from "../shared";

export interface AppointmentConfirmationData {
  patientName: string;
  doctorName: string;
  clinicName?: string;
  appointmentDate: string;
  startTime: string;
  appointmentType: "video" | "in_person";
  videoCallLink?: string | null;
  portalUrl?: string;
}

const render: TemplateFn<AppointmentConfirmationData> = (
  data,
  _locale?: Locale,
): RenderedTemplate => {
  const locationLine =
    data.appointmentType === "video"
      ? data.videoCallLink
        ? `Join your video call: <a href="${escHtml(data.videoCallLink)}">${escHtml(data.videoCallLink)}</a>`
        : "Your doctor will share the video call link shortly."
      : `In-person visit${data.clinicName ? ` at ${escHtml(data.clinicName)}` : ""}`;

  const inner = `
    <p>Hi ${escHtml(data.patientName)},</p>
    <p>Your appointment with <strong>Dr. ${escHtml(data.doctorName)}</strong> is confirmed.</p>
    <table style="border-collapse:collapse;width:100%;margin:16px 0;">
      <tr><td style="padding:6px;color:#6b7280;">Date</td><td style="padding:6px;font-weight:600;">${escHtml(data.appointmentDate)}</td></tr>
      <tr><td style="padding:6px;color:#6b7280;">Time</td><td style="padding:6px;font-weight:600;">${escHtml(data.startTime)}</td></tr>
      <tr><td style="padding:6px;color:#6b7280;">Type</td><td style="padding:6px;">${data.appointmentType === "video" ? "Video Call" : "In-Person Visit"}</td></tr>
    </table>
    <p>${locationLine}</p>
    ${data.portalUrl ? `<p><a href="${escHtml(data.portalUrl)}" style="display:inline-block;margin-top:8px;padding:10px 18px;background:#0a0a0a;color:#fff;border-radius:6px;text-decoration:none;">Manage appointment</a></p>` : ""}
  `;

  return {
    subject: `Your appointment with Dr. ${data.doctorName} is confirmed`,
    body: emailShell("Appointment Confirmation", inner),
  };
};

export default render;
