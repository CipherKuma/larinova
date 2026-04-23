import type { RenderedTemplate, TemplateFn } from "../../types";
import type { FollowupPromptData } from "../followup_prompt_day1/whatsapp";

const render: TemplateFn<FollowupPromptData> = (data): RenderedTemplate => ({
  body:
    data.promptBody ??
    `Hi ${data.patientName}, checking in again on behalf of Dr. ${data.doctorName}. How have the last couple of days been? Any issues with the medication, or anything feeling worse?\n\nReply STOP to opt out.`,
});

export default render;
