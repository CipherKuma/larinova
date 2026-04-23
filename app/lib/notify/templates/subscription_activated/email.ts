import type { RenderedTemplate, TemplateFn } from "../../types";
import { emailShell, escHtml } from "../shared";

export interface SubscriptionActivatedData {
  doctorName: string;
  planLabel: string;
  renewalDate?: string;
  appUrl?: string;
}

const render: TemplateFn<SubscriptionActivatedData> = (
  data,
): RenderedTemplate => {
  const inner = `
    <p>Hi Dr. ${escHtml(data.doctorName)},</p>
    <p>Your Larinova Pro subscription is active — <strong>${escHtml(data.planLabel)}</strong>.</p>
    ${data.renewalDate ? `<p>Next renewal: <strong>${escHtml(data.renewalDate)}</strong>.</p>` : ""}
    <p>You now have unlimited consultations, priority support, and early access to everything we ship. Thank you.</p>
    ${data.appUrl ? `<p><a href="${escHtml(data.appUrl)}" style="display:inline-block;margin-top:6px;padding:10px 18px;background:#0a0a0a;color:#fff;border-radius:6px;text-decoration:none;">Open Larinova</a></p>` : ""}
  `;
  return {
    subject: "Your Larinova Pro subscription is active",
    body: emailShell("Subscription Activated", inner),
  };
};

export default render;
