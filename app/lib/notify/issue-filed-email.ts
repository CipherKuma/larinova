import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "larinova@contact.raxgbc.co.in";
const ADMIN_TO = "gabrielantony56@gmail.com";

export async function sendIssueFiledEmail(args: {
  doctor: { full_name: string; email: string };
  issue: { id: string; title: string; body: string; priority: string };
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[issue-filed-email] RESEND_API_KEY missing — skipping send");
    return;
  }
  const resend = new Resend(apiKey);

  const adminLink = `https://app.larinova.com/in/admin/issues/${args.issue.id}`;
  const bodyExcerpt =
    args.issue.body.slice(0, 500) + (args.issue.body.length > 500 ? "…" : "");
  const firstName = args.doctor.full_name.split(" ")[0];
  const subject = `[Larinova alpha] Dr. ${firstName} filed: ${args.issue.title}`;
  const html = `
    <div style="font-family:-apple-system,sans-serif;max-width:600px;margin:24px auto;padding:24px;background:#fff">
      <h2 style="margin:0 0 12px">New issue filed</h2>
      <p style="margin:0 0 8px;color:#555;font-size:14px"><strong>${args.doctor.full_name}</strong> &lt;${args.doctor.email}&gt;</p>
      <p style="margin:0 0 8px;color:#555;font-size:13px;text-transform:uppercase;letter-spacing:1px">Priority: ${args.issue.priority}</p>
      <h3 style="margin:16px 0 8px">${args.issue.title}</h3>
      <div style="white-space:pre-wrap;font-size:14px;color:#333;line-height:1.6;border-left:3px solid #10b079;padding-left:12px">${bodyExcerpt.replace(/</g, "&lt;")}</div>
      <p style="margin:24px 0 0"><a href="${adminLink}" style="background:#10b079;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">Open in admin</a></p>
    </div>`;
  await resend.emails.send({
    from: FROM,
    to: ADMIN_TO,
    subject,
    html,
  });
}
