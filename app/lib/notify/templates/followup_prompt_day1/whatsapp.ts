import type { RenderedTemplate, TemplateFn } from "../../types";

export interface FollowupPromptData {
  patientName: string;
  doctorName: string;
  chiefComplaint?: string;
  promptBody?: string;
}

const render: TemplateFn<FollowupPromptData> = (data): RenderedTemplate => ({
  body:
    data.promptBody ??
    `Hi ${data.patientName}, it's Larinova checking in on behalf of Dr. ${data.doctorName}. How are you feeling today${
      data.chiefComplaint
        ? ` — any change in your ${data.chiefComplaint}?`
        : "?"
    }\n\nReply anytime. Reply STOP to opt out.`,
});

export default render;
