import type { RenderedTemplate, TemplateFn } from "../../types";
import type { FollowupFlaggedDoctorData } from "./email";

const render: TemplateFn<FollowupFlaggedDoctorData> = (
  data,
): RenderedTemplate => ({
  subject: `Follow-up flagged: ${data.patientName}`,
  body: `${data.patientName} flagged on ${data.tier}: ${data.reason}`,
});

export default render;
