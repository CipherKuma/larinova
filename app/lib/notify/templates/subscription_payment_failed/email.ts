import type { RenderedTemplate, TemplateFn } from "../../types";
import { emailShell, escHtml } from "../shared";

export interface SubscriptionPaymentFailedData {
  doctorName: string;
  planLabel: string;
  retryDate?: string;
  billingUrl?: string;
}

const render: TemplateFn<SubscriptionPaymentFailedData> = (
  data,
): RenderedTemplate => {
  const inner = `
    <p>Hi Dr. ${escHtml(data.doctorName)},</p>
    <p>We couldn't charge your card for <strong>${escHtml(data.planLabel)}</strong>. Your access is unchanged for now, but if the retry fails your plan will drop back to Free.</p>
    ${data.retryDate ? `<p>Razorpay will retry on <strong>${escHtml(data.retryDate)}</strong>.</p>` : ""}
    ${data.billingUrl ? `<p><a href="${escHtml(data.billingUrl)}" style="display:inline-block;margin-top:6px;padding:10px 18px;background:#0a0a0a;color:#fff;border-radius:6px;text-decoration:none;">Update payment method</a></p>` : ""}
    <p>If you need help, reply to this email.</p>
  `;
  return {
    subject: "[Action needed] Larinova Pro — payment failed",
    body: emailShell("Payment failed", inner),
  };
};

export default render;
