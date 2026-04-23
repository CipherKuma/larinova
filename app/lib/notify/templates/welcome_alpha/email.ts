import type { RenderedTemplate, TemplateFn } from "../../types";
import { emailShell, escHtml } from "../shared";

export interface WelcomeAlphaData {
  doctorName: string;
  appUrl?: string;
}

const render: TemplateFn<WelcomeAlphaData> = (data): RenderedTemplate => {
  const inner = `
    <p>Dear Dr. ${escHtml(data.doctorName)},</p>
    <p>You're one of our first alpha doctors — thank you. Every note you dictate, every tweak you suggest, every rough edge you call out shapes how Larinova works for every doctor after you.</p>
    <p>Your Pro access is active, no credit card, no expiry during the pilot. You'll get a direct line to the founder; WhatsApp or email anytime.</p>
    ${data.appUrl ? `<p><a href="${escHtml(data.appUrl)}" style="display:inline-block;margin-top:6px;padding:10px 18px;background:#0a0a0a;color:#fff;border-radius:6px;text-decoration:none;">Open Larinova</a></p>` : ""}
    <p>— Gabriel<br>Founder, Larinova</p>
  `;
  return {
    subject: "Welcome to Larinova, alpha doctor",
    body: emailShell("Alpha Pilot — Welcome", inner),
  };
};

export default render;
