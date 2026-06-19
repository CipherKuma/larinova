import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/notify/email";
import { emailShell, escHtml } from "@/lib/notify/templates/shared";
import { DOCUMENT_TYPES, type DocumentType } from "@/types/helena";

// Accepts a client-rendered PDF (html2pdf produces it in the browser) as a
// base64 string so we can attach the exact rendered document to the email.
const sendSchema = z.object({
  pdfBase64: z.string().min(1).optional(),
  pdfFilename: z.string().min(1).max(200).optional(),
});

function isPlaceholderEmail(email: string | null | undefined): boolean {
  if (!email) return true;
  return (
    email.includes("@unknown.larinova") ||
    email.includes("@placeholder.larinova")
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: documentId } = await params;

    let parsed: z.infer<typeof sendSchema> = {};
    try {
      const raw = await req.json();
      parsed = sendSchema.parse(raw ?? {});
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid request", code: "invalid_body" },
          { status: 400 },
        );
      }
      // No body / not JSON → send without an attachment.
      parsed = {};
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "unauthorized" },
        { status: 401 },
      );
    }

    // Resolve the authenticated doctor for an explicit ownership check
    // (defense in depth — do not rely on RLS alone).
    const { data: doctor } = await supabase
      .from("larinova_doctors")
      .select("id, full_name")
      .eq("user_id", user.id)
      .single();

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found", code: "doctor_not_found" },
        { status: 404 },
      );
    }

    const { data: document, error: docError } = await supabase
      .from("larinova_documents")
      .select(
        `
        id, doctor_id, document_type, title, status,
        patient:larinova_patients(id, full_name, email)
      `,
      )
      .eq("id", documentId)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: "Document not found", code: "not_found" },
        { status: 404 },
      );
    }

    if (document.doctor_id !== doctor.id) {
      return NextResponse.json(
        { error: "Forbidden", code: "forbidden" },
        { status: 403 },
      );
    }

    // Supabase types a to-one join as an array; normalize to a single row.
    const patientJoin = document.patient as unknown as
      | { id: string; full_name: string; email: string | null }
      | { id: string; full_name: string; email: string | null }[]
      | null;
    const patient = Array.isArray(patientJoin)
      ? (patientJoin[0] ?? null)
      : patientJoin;

    if (!patient) {
      return NextResponse.json(
        { error: "No patient linked to this document", code: "no_patient" },
        { status: 400 },
      );
    }

    if (isPlaceholderEmail(patient.email)) {
      return NextResponse.json(
        { error: "Patient email not available", code: "no_email" },
        { status: 400 },
      );
    }

    const docLabel =
      DOCUMENT_TYPES[document.document_type as DocumentType]?.label ||
      "document";
    const doctorName = doctor.full_name || "your doctor";

    const inner = `
      <p>Hi ${escHtml(patient.full_name)},</p>
      <p><strong>Dr. ${escHtml(doctorName)}</strong> has issued the following ${escHtml(
        docLabel.toLowerCase(),
      )} for you:</p>
      <div style="background:#f9f9f9;border-radius:6px;padding:16px;margin:16px 0;font-size:15px;font-weight:600;">${escHtml(
        document.title,
      )}</div>
      ${
        parsed.pdfBase64
          ? `<p>The document is attached as a PDF.</p>`
          : `<p>Please contact the clinic to receive a copy of this document.</p>`
      }
      <p style="color:#888;font-size:12px;margin-top:24px;">If you have questions about this document, please reply to your clinic directly.</p>
    `;

    const filename =
      (parsed.pdfFilename ||
        `${document.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`).replace(
        /\.pdf$/i,
        "",
      ) + ".pdf";

    const result = await sendEmail(
      {
        subject: `${docLabel} from Dr. ${doctorName}`,
        body: emailShell(docLabel, inner),
        attachments: parsed.pdfBase64
          ? [
              {
                filename,
                content: parsed.pdfBase64,
                contentType: "application/pdf",
              },
            ]
          : undefined,
      },
      { email: patient.email!, name: patient.full_name },
    );

    if (result.status === "failed") {
      return NextResponse.json(
        { error: "Failed to send document", code: "send_failed" },
        { status: 502 },
      );
    }

    const sentAt = new Date().toISOString();
    const { data: updated, error: updateError } = await supabase
      .from("larinova_documents")
      .update({ status: "sent", sent_at: sentAt, sent_to: patient.email })
      .eq("id", documentId)
      .eq("doctor_id", doctor.id)
      .select()
      .single();

    if (updateError) {
      // Email went out, but the status write failed — report success for the
      // send and surface the persistence problem.
      return NextResponse.json(
        {
          success: true,
          sent_at: sentAt,
          sent_to: patient.email,
          warning: "sent_but_status_unwritten",
        },
        { status: 200 },
      );
    }

    return NextResponse.json({
      success: true,
      document: updated,
      sent_at: sentAt,
      sent_to: patient.email,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "internal_error" },
      { status: 500 },
    );
  }
}
