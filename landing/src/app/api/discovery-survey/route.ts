import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FROM_EMAIL =
  process.env.DISCOVERY_FROM_EMAIL || "Larinova <hello@larinova.com>";
const TEAM_EMAIL = process.env.DISCOVERY_TEAM_EMAIL;

type Payload = {
  locale: "en" | "id";
  name: string;
  specialization: string;
  clinic: string;
  city: string;
  whatsapp: string;
  email: string;
  patientsPerDay: string;
  dataStorage: string[];
  dataStorageOther: string;
  paperworkTime: string;
  shiftNotes: string;
  referralTime: string;
  problems: string[];
  priorities: string[];
  tellUsMore: string;
};

const copy = {
  en: {
    subject: "Thanks for filling out the Larinova survey!",
    preheader: "You're in — here's what happens next.",
    greeting: (name: string) => `Hi Dr. ${name},`,
    thanks:
      "Thank you for taking the time to share your day-to-day challenges with us. Your answers help us build Larinova for the way Indian doctors actually work.",
    whatsNext: "What happens next",
    steps: [
      "Our team will reach out to you on WhatsApp within 24 hours.",
      "We'll activate your free 1-month access to Larinova — no credit card required.",
      "You'll get a personal walkthrough in your language.",
    ],
    questions:
      "Have questions in the meantime? Just reply to this email — a real human on our team will read it.",
    signoff: "With gratitude,",
    team: "The Larinova Team",
    footer: "Larinova · Clinic Management & AI Platform for Indian Doctors",
  },
  id: {
    subject: "Terima kasih sudah mengisi survei Larinova!",
    preheader: "Kamu sudah terdaftar — berikut langkah selanjutnya.",
    greeting: (name: string) => `Halo Dr. ${name},`,
    thanks:
      "Terima kasih sudah meluangkan waktu untuk berbagi tantangan sehari-harimu. Jawabanmu membantu kami membangun Larinova sesuai cara kerja dokter Indonesia.",
    whatsNext: "Langkah selanjutnya",
    steps: [
      "Tim kami akan menghubungimu via WhatsApp dalam 24 jam.",
      "Kami akan mengaktifkan akses gratis 1 bulan ke Larinova — tanpa kartu kredit.",
      "Kamu akan dapat walkthrough personal dalam Bahasa Indonesia.",
    ],
    questions:
      "Ada pertanyaan? Langsung balas email ini — tim kami (manusia sungguhan) akan membacanya.",
    signoff: "Salam hangat,",
    team: "Tim Larinova",
    footer: "Larinova · Platform Manajemen Klinik & AI untuk Dokter Indonesia",
  },
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function renderAckEmail(locale: "en" | "id", name: string) {
  const c = copy[locale];
  return `<!DOCTYPE html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${c.subject}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0a0f1e;">
    <div style="display:none;max-height:0;overflow:hidden;">${c.preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(10,15,30,0.06);">
            <tr>
              <td style="background:linear-gradient(135deg,#10b981 0%,#0d9488 100%);padding:32px 40px;">
                <div style="font-family:'Outfit',sans-serif;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Larinova</div>
                <div style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:4px;">${c.footer.split("·")[1]?.trim() ?? ""}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;">${c.greeting(name)}</p>
                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.7;color:#374151;">${c.thanks}</p>

                <h2 style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#0a0f1e;text-transform:uppercase;letter-spacing:0.04em;">${c.whatsNext}</h2>
                <ol style="margin:0 0 24px 20px;padding:0;color:#374151;font-size:15px;line-height:1.7;">
                  ${c.steps.map((s) => `<li style="margin-bottom:8px;">${s}</li>`).join("")}
                </ol>

                <p style="margin:0 0 28px 0;font-size:14px;line-height:1.7;color:#6b7280;">${c.questions}</p>

                <p style="margin:0;font-size:15px;color:#374151;">${c.signoff}<br /><strong style="color:#0a0f1e;">${c.team}</strong></p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;font-size:12px;color:#9ca3af;">
                ${c.footer}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderTeamNotification(payload: Payload) {
  const rows: [string, string][] = [
    ["Locale", payload.locale],
    ["Name", payload.name],
    ["Specialization", payload.specialization],
    ["Clinic", payload.clinic],
    ["City", payload.city],
    ["WhatsApp", payload.whatsapp],
    ["Email", payload.email || "—"],
    ["Patients/day", payload.patientsPerDay || "—"],
    [
      "Data storage",
      [...payload.dataStorage, payload.dataStorageOther]
        .filter(Boolean)
        .join(", ") || "—",
    ],
    ["Paperwork time", payload.paperworkTime || "—"],
    ["Shift notes backlog", payload.shiftNotes || "—"],
    ["Referral letter time", payload.referralTime || "—"],
    ["Problems", payload.problems.join(", ") || "—"],
    ["Top priorities", payload.priorities.join(", ") || "—"],
    ["Tell us more", payload.tellUsMore || "—"],
  ];

  const rowsHtml = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb;vertical-align:top;width:170px;">${k}</td><td style="padding:8px 12px;color:#0a0f1e;border-bottom:1px solid #e5e7eb;">${escapeHtml(v)}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;padding:24px;background:#f5f7fa;">
  <h2 style="margin:0 0 16px 0;">New discovery survey submission</h2>
  <table style="border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;width:100%;max-width:640px;">${rowsHtml}</table>
  </body></html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Email service not configured" },
      { status: 500 },
    );
  }

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const required: (keyof Payload)[] = [
    "name",
    "specialization",
    "clinic",
    "city",
    "whatsapp",
  ];
  for (const key of required) {
    if (!body[key] || typeof body[key] !== "string") {
      return NextResponse.json(
        { error: `Missing field: ${key}` },
        { status: 400 },
      );
    }
  }

  const locale: "en" | "id" = body.locale === "id" ? "id" : "en";
  const c = copy[locale];

  // Save to Supabase
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    const { error: dbError } = await supabase
      .from("larinova_discovery_surveys")
      .insert({
        locale: body.locale === "id" ? "id" : "en",
        name: body.name,
        specialization: body.specialization,
        clinic: body.clinic,
        city: body.city,
        whatsapp: body.whatsapp,
        email: body.email || null,
        patients_per_day: body.patientsPerDay || null,
        data_storage: body.dataStorage || [],
        data_storage_other: body.dataStorageOther || null,
        paperwork_time: body.paperworkTime || null,
        shift_notes: body.shiftNotes || null,
        referral_time: body.referralTime || null,
        problems: body.problems || [],
        priorities: body.priorities || [],
        tell_us_more: body.tellUsMore || null,
      });
    if (dbError) {
      console.error("Discovery survey DB save failed:", dbError);
    }
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    if (body.email && isValidEmail(body.email)) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: body.email,
        subject: c.subject,
        html: renderAckEmail(locale, body.name),
      });
    }

    if (TEAM_EMAIL) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: TEAM_EMAIL,
        subject: `[Discovery Survey] ${body.name} · ${body.clinic}`,
        html: renderTeamNotification(body),
        replyTo:
          body.email && isValidEmail(body.email) ? body.email : undefined,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Discovery survey send failed:", err);
    return NextResponse.json(
      { error: "Failed to send confirmation. Please try again." },
      { status: 500 },
    );
  }
}
