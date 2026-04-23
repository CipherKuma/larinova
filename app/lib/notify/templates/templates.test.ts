import { describe, expect, it } from "vitest";
import { renderTemplate, TEMPLATES, type TemplateKey } from "./index";

describe("template registry", () => {
  it("includes all 12 template keys from the spec", () => {
    const expected: TemplateKey[] = [
      "appointment_confirmation",
      "appointment_reminder_1d",
      "appointment_reminder_1h",
      "intake_info_request",
      "consultation_summary",
      "followup_prompt_day1",
      "followup_prompt_day3",
      "followup_prompt_day7",
      "followup_flagged_doctor",
      "welcome_alpha",
      "subscription_activated",
      "subscription_payment_failed",
    ];
    for (const key of expected) {
      expect(TEMPLATES[key]).toBeDefined();
    }
  });

  it("covers channels per the spec catalogue", () => {
    expect(TEMPLATES.appointment_confirmation.email).toBeDefined();
    expect(TEMPLATES.appointment_confirmation.sms).toBeDefined();
    expect(TEMPLATES.appointment_confirmation.whatsapp).toBeDefined();

    expect(TEMPLATES.appointment_reminder_1h.sms).toBeDefined();
    expect(TEMPLATES.appointment_reminder_1h.whatsapp).toBeDefined();
    expect(TEMPLATES.appointment_reminder_1h.email).toBeUndefined();

    expect(TEMPLATES.intake_info_request.email).toBeDefined();
    expect(TEMPLATES.intake_info_request.whatsapp).toBeDefined();
    expect(TEMPLATES.intake_info_request.sms).toBeUndefined();

    expect(TEMPLATES.followup_prompt_day1.whatsapp).toBeDefined();
    expect(TEMPLATES.followup_prompt_day1.email).toBeUndefined();

    expect(TEMPLATES.followup_flagged_doctor.email).toBeDefined();
    expect(TEMPLATES.followup_flagged_doctor.in_app).toBeDefined();

    expect(TEMPLATES.welcome_alpha.email).toBeDefined();
    expect(TEMPLATES.subscription_activated.email).toBeDefined();
    expect(TEMPLATES.subscription_payment_failed.email).toBeDefined();
  });
});

describe("renderTemplate", () => {
  it("renders an appointment_confirmation email with subject + body", () => {
    const r = renderTemplate("appointment_confirmation", "email", {
      patientName: "Raj",
      doctorName: "Priya",
      appointmentDate: "2026-05-04",
      startTime: "10:30",
      appointmentType: "in_person",
    });
    expect(r.subject).toContain("Dr. Priya");
    expect(r.body).toContain("Raj");
    expect(r.body).toContain("2026-05-04");
  });

  it("renders an appointment_confirmation sms under carrier length", () => {
    const r = renderTemplate("appointment_confirmation", "sms", {
      patientName: "Raj",
      doctorName: "Priya",
      appointmentDate: "2026-05-04",
      startTime: "10:30",
      appointmentType: "in_person",
    });
    expect(r.body).toContain("Dr. Priya");
    expect(r.body.length).toBeLessThan(320); // DLT SMS budget
  });

  it("renders a followup_prompt_day3 whatsapp with STOP opt-out", () => {
    const r = renderTemplate("followup_prompt_day3", "whatsapp", {
      patientName: "Raj",
      doctorName: "Priya",
    });
    expect(r.body).toContain("STOP");
    expect(r.body).toContain("Priya");
  });

  it("throws for an invalid channel on a template", () => {
    expect(() =>
      renderTemplate("welcome_alpha", "sms", { doctorName: "Priya" }),
    ).toThrow(/no template for welcome_alpha on sms/);
  });

  it("renders consultation_summary email with optional Rx attachment", () => {
    const r = renderTemplate("consultation_summary", "email", {
      patientName: "Raj",
      doctorName: "Priya",
      consultationDate: "2026-05-04",
      plainSummary: "Mild fever, rest and fluids. Paracetamol 500mg as needed.",
      diagnosis: "Viral fever",
      rxPdfBase64: "JVBERi0xLjQ=",
      rxPdfFilename: "rx-0001.pdf",
    });
    expect(r.attachments?.[0].filename).toBe("rx-0001.pdf");
    expect(r.attachments?.[0].contentType).toBe("application/pdf");
  });
});
