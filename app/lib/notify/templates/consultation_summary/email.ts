import type { RenderedTemplate, TemplateFn } from "../../types";
import { emailShell, escHtml } from "../shared";

export interface ConsultationSummaryData {
  patientName: string;
  doctorName: string;
  consultationDate: string;
  plainSummary: string;
  diagnosis?: string;
  portalUrl?: string;
  rxPdfBase64?: string;
  rxPdfFilename?: string;
}

const render: TemplateFn<ConsultationSummaryData> = (
  data,
): RenderedTemplate => {
  const inner = `
    <p>Hi ${escHtml(data.patientName)},</p>
    <p>Here's the summary of your consultation with <strong>Dr. ${escHtml(data.doctorName)}</strong> on <strong>${escHtml(data.consultationDate)}</strong>.</p>
    ${data.diagnosis ? `<p><strong>Diagnosis:</strong> ${escHtml(data.diagnosis)}</p>` : ""}
    <div style="background:#f9f9f9;border-radius:6px;padding:16px;margin:16px 0;font-size:14px;line-height:1.65;">${escHtml(data.plainSummary)}</div>
    <p>Your prescription is attached as a PDF.</p>
    ${data.portalUrl ? `<p><a href="${escHtml(data.portalUrl)}" style="display:inline-block;margin-top:6px;padding:10px 18px;background:#0a0a0a;color:#fff;border-radius:6px;text-decoration:none;">View full record</a></p>` : ""}
  `;
  return {
    subject: `Your consultation summary — ${data.consultationDate}`,
    body: emailShell("Consultation Summary", inner),
    attachments:
      data.rxPdfBase64 && data.rxPdfFilename
        ? [
            {
              filename: data.rxPdfFilename,
              content: data.rxPdfBase64,
              contentType: "application/pdf",
            },
          ]
        : undefined,
  };
};

export default render;
