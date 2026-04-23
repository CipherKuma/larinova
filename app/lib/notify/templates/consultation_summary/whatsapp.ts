import type { RenderedTemplate, TemplateFn } from "../../types";
import type { ConsultationSummaryData } from "./email";

export interface ConsultationSummaryWhatsappData extends ConsultationSummaryData {
  rxPdfUrl?: string;
}

const render: TemplateFn<ConsultationSummaryWhatsappData> = (
  data,
): RenderedTemplate => {
  const pdfLine = data.rxPdfUrl ? `\n\nPrescription PDF: ${data.rxPdfUrl}` : "";
  const portalLine = data.portalUrl ? `\nFull record: ${data.portalUrl}` : "";
  return {
    body: `Hi ${data.patientName}, here's a quick summary of today's visit with Dr. ${data.doctorName}:\n\n${data.plainSummary}${pdfLine}${portalLine}`,
  };
};

export default render;
