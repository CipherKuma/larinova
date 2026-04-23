import type { RenderedTemplate, TemplateFn } from "../../types";
import type { ConsultationSummaryData } from "./email";

export interface ConsultationSummarySmsData extends ConsultationSummaryData {
  portalShortLink?: string;
}

const render: TemplateFn<ConsultationSummarySmsData> = (
  data,
): RenderedTemplate => ({
  body: `Larinova: Consultation summary from Dr. ${data.doctorName} is ready. ${
    data.portalShortLink ??
    data.portalUrl ??
    "Check your email for the full record and Rx."
  }`,
});

export default render;
