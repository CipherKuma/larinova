import type { RenderedTemplate, TemplateFn } from "../../types";
import type { IntakeInfoRequestData } from "./email";

const render: TemplateFn<IntakeInfoRequestData> = (data): RenderedTemplate => {
  const qs = data.questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
  const docs = data.documentsRequested?.length
    ? `\n\nIf you have any of these to share, please upload: ${data.documentsRequested.join(", ")}.`
    : "";
  return {
    body: `Hi ${data.patientName}, Dr. ${data.doctorName} would like a little more info before your visit:\n\n${qs}${docs}\n\nYou can reply here, or just mention it in person. Reply STOP to opt out.`,
  };
};

export default render;
