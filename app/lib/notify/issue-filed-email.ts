import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "larinova@contact.raxgbc.co.in";
const ADMIN_TO = "gabrielantony56@gmail.com";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>New issue filed</title>
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    body { margin:0; padding:0; background:#f4f5f7; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; }
    .card { max-width:600px; margin:24px auto; padding:24px; background:#ffffff; border-radius:10px; box-shadow:0 2px 12px rgba(0,0,0,0.06); }
    .heading { margin:0 0 12px; color:#0a0a0a; font-size:20px; }
    .meta { margin:0 0 8px; color:#555555; font-size:14px; }
    .meta-strong { color:#0a0a0a; }
    .priority { margin:0 0 8px; color:#555555; font-size:13px; text-transform:uppercase; letter-spacing:1px; }
    .title { margin:16px 0 8px; color:#0a0a0a; font-size:18px; }
    .quote { white-space:pre-wrap; font-size:14px; color:#333333; line-height:1.6; border-left:3px solid #10b079; padding:8px 0 8px 12px; background:#f8fafc; border-radius:0 4px 4px 0; }
    .cta { display:inline-block; background:#10b079; color:#ffffff !important; padding:10px 18px; border-radius:6px; text-decoration:none; font-weight:600; font-size:14px; }
    @media (prefers-color-scheme: dark) {
      body { background:#0d1117 !important; }
      .card { background:#161b22 !important; box-shadow:0 4px 24px rgba(0,0,0,0.5) !important; }
      .heading { color:#ffffff !important; }
      .meta { color:#b8bdc4 !important; }
      .meta-strong { color:#ffffff !important; }
      .priority { color:#8a9098 !important; }
      .title { color:#ffffff !important; }
      .quote { color:#d0d4d9 !important; background:#1c222b !important; border-left-color:#34d8a0 !important; }
    }
    [data-ogsc] body, [data-ogsb] body { background:#0d1117 !important; }
    [data-ogsc] .card, [data-ogsb] .card { background:#161b22 !important; }
    [data-ogsc] .heading, [data-ogsb] .heading { color:#ffffff !important; }
    [data-ogsc] .meta, [data-ogsb] .meta { color:#b8bdc4 !important; }
    [data-ogsc] .meta-strong, [data-ogsb] .meta-strong { color:#ffffff !important; }
    [data-ogsc] .priority, [data-ogsb] .priority { color:#8a9098 !important; }
    [data-ogsc] .title, [data-ogsb] .title { color:#ffffff !important; }
    [data-ogsc] .quote, [data-ogsb] .quote { color:#d0d4d9 !important; background:#1c222b !important; }
  </style>
</head>
<body>
  <div class="card">
    <h2 class="heading">New issue filed</h2>
    <p class="meta"><strong class="meta-strong">${esc(args.doctor.full_name)}</strong> &lt;${esc(args.doctor.email)}&gt;</p>
    <p class="priority">Priority: ${esc(args.issue.priority)}</p>
    <h3 class="title">${esc(args.issue.title)}</h3>
    <div class="quote">${esc(bodyExcerpt)}</div>
    <p style="margin:24px 0 0"><a href="${adminLink}" class="cta">Open in admin</a></p>
  </div>
</body>
</html>`;
  await resend.emails.send({
    from: FROM,
    to: ADMIN_TO,
    subject,
    html,
  });
}
