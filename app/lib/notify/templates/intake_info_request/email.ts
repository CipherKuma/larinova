import type { RenderedTemplate, TemplateFn } from "../../types";
import { emailShell, escHtml } from "../shared";

export interface IntakeInfoRequestData {
  patientName: string;
  doctorName: string;
  questions: string[];
  documentsRequested?: string[];
  portalUrl?: string;
}

const render: TemplateFn<IntakeInfoRequestData> = (data): RenderedTemplate => {
  const qs = data.questions
    .map((q) => `<li style="margin-bottom:6px;">${escHtml(q)}</li>`)
    .join("");
  const docs = data.documentsRequested?.length
    ? `<p><strong>Documents we'd like to see:</strong></p><ul>${data.documentsRequested
        .map((d) => `<li>${escHtml(d)}</li>`)
        .join("")}</ul>`
    : "";
  const inner = `
    <p>Hi ${escHtml(data.patientName)},</p>
    <p>Before your visit with <strong>Dr. ${escHtml(data.doctorName)}</strong>, we'd like a little more context so the consultation is as useful as possible.</p>
    <p><strong>A few questions:</strong></p>
    <ul>${qs}</ul>
    ${docs}
    ${data.portalUrl ? `<p><a href="${escHtml(data.portalUrl)}" style="display:inline-block;margin-top:6px;padding:10px 18px;background:#0a0a0a;color:#fff;border-radius:6px;text-decoration:none;">Reply on portal</a></p>` : ""}
    <p style="color:#6b7280;font-size:13px;margin-top:14px;">You can also skip — just tell Dr. ${escHtml(data.doctorName)} in person.</p>
  `;
  return {
    subject: `Dr. ${data.doctorName} needs a little more info before your visit`,
    body: emailShell("Pre-consult questions", inner),
  };
};

export default render;
