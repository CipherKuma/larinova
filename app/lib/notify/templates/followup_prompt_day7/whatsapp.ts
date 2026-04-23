import type { RenderedTemplate, TemplateFn } from "../../types";
import type { FollowupPromptData } from "../followup_prompt_day1/whatsapp";

const render: TemplateFn<FollowupPromptData> = (data): RenderedTemplate => ({
  body:
    data.promptBody ??
    `Hi ${data.patientName}, it's been a week since your consult with Dr. ${data.doctorName}. How are you doing now? If the issue is fully resolved, just say "better" — if not, tell us what's still going on and we'll take it from there.\n\nReply STOP to opt out.`,
});

export default render;
