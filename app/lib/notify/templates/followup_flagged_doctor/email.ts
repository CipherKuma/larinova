import type { RenderedTemplate, TemplateFn } from "../../types";
import { emailShell, escHtml } from "../shared";

export interface FollowupFlaggedDoctorData {
  doctorName: string;
  patientName: string;
  tier: "day-1" | "day-3" | "day-7";
  reason: string;
  transcriptSnippet: string;
  threadUrl?: string;
  rescheduleUrl?: string;
}

const render: TemplateFn<FollowupFlaggedDoctorData> = (
  data,
): RenderedTemplate => {
  const inner = `
    <p>Hi Dr. ${escHtml(data.doctorName)},</p>
    <p>The wellness follow-up agent flagged <strong>${escHtml(data.patientName)}</strong> on the <strong>${escHtml(data.tier)}</strong> check-in.</p>
    <div style="background:#fff5f5;border:1px solid #fed7d7;border-radius:6px;padding:12px 16px;margin:14px 0;color:#9b2c2c;">
      <strong>Reason:</strong> ${escHtml(data.reason)}
    </div>
    <p><strong>Recent messages:</strong></p>
    <pre style="background:#f9f9f9;border-radius:6px;padding:12px 16px;white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;">${escHtml(data.transcriptSnippet)}</pre>
    ${data.threadUrl ? `<p><a href="${escHtml(data.threadUrl)}" style="display:inline-block;margin-right:8px;padding:10px 18px;background:#0a0a0a;color:#fff;border-radius:6px;text-decoration:none;">Open thread</a>${data.rescheduleUrl ? `<a href="${escHtml(data.rescheduleUrl)}" style="display:inline-block;padding:10px 18px;background:#f5f5f5;color:#111;border-radius:6px;text-decoration:none;">Schedule follow-up</a>` : ""}</p>` : ""}
  `;
  return {
    subject: `[Larinova] ${data.patientName} flagged on ${data.tier} follow-up`,
    body: emailShell("Follow-up flagged", inner),
  };
};

export default render;
