import type { Channel, RenderedTemplate, TemplateFn } from "../types";

// Eagerly imported so runtime resolution is type-safe and testable.
import appointmentConfirmationEmail from "./appointment_confirmation/email";
import appointmentConfirmationSms from "./appointment_confirmation/sms";
import appointmentConfirmationWhatsapp from "./appointment_confirmation/whatsapp";
import appointmentReminder1dEmail from "./appointment_reminder_1d/email";
import appointmentReminder1dSms from "./appointment_reminder_1d/sms";
import appointmentReminder1dWhatsapp from "./appointment_reminder_1d/whatsapp";
import appointmentReminder1hSms from "./appointment_reminder_1h/sms";
import appointmentReminder1hWhatsapp from "./appointment_reminder_1h/whatsapp";
import intakeInfoRequestEmail from "./intake_info_request/email";
import intakeInfoRequestWhatsapp from "./intake_info_request/whatsapp";
import consultationSummaryEmail from "./consultation_summary/email";
import consultationSummarySms from "./consultation_summary/sms";
import consultationSummaryWhatsapp from "./consultation_summary/whatsapp";
import followupPromptDay1 from "./followup_prompt_day1/whatsapp";
import followupPromptDay3 from "./followup_prompt_day3/whatsapp";
import followupPromptDay7 from "./followup_prompt_day7/whatsapp";
import followupFlaggedDoctorEmail from "./followup_flagged_doctor/email";
import followupFlaggedDoctorInApp from "./followup_flagged_doctor/in_app";
import welcomeAlphaEmail from "./welcome_alpha/email";
import subscriptionActivatedEmail from "./subscription_activated/email";
import subscriptionPaymentFailedEmail from "./subscription_payment_failed/email";

export type TemplateKey =
  | "appointment_confirmation"
  | "appointment_reminder_1d"
  | "appointment_reminder_1h"
  | "intake_info_request"
  | "consultation_summary"
  | "followup_prompt_day1"
  | "followup_prompt_day3"
  | "followup_prompt_day7"
  | "followup_flagged_doctor"
  | "welcome_alpha"
  | "subscription_activated"
  | "subscription_payment_failed";

type Registry = Partial<Record<Channel, TemplateFn<any>>>;

export const TEMPLATES: Record<TemplateKey, Registry> = {
  appointment_confirmation: {
    email: appointmentConfirmationEmail,
    sms: appointmentConfirmationSms,
    whatsapp: appointmentConfirmationWhatsapp,
  },
  appointment_reminder_1d: {
    email: appointmentReminder1dEmail,
    sms: appointmentReminder1dSms,
    whatsapp: appointmentReminder1dWhatsapp,
  },
  appointment_reminder_1h: {
    sms: appointmentReminder1hSms,
    whatsapp: appointmentReminder1hWhatsapp,
  },
  intake_info_request: {
    email: intakeInfoRequestEmail,
    whatsapp: intakeInfoRequestWhatsapp,
  },
  consultation_summary: {
    email: consultationSummaryEmail,
    sms: consultationSummarySms,
    whatsapp: consultationSummaryWhatsapp,
  },
  followup_prompt_day1: { whatsapp: followupPromptDay1 },
  followup_prompt_day3: { whatsapp: followupPromptDay3 },
  followup_prompt_day7: { whatsapp: followupPromptDay7 },
  followup_flagged_doctor: {
    email: followupFlaggedDoctorEmail,
    in_app: followupFlaggedDoctorInApp,
  },
  welcome_alpha: { email: welcomeAlphaEmail },
  subscription_activated: { email: subscriptionActivatedEmail },
  subscription_payment_failed: { email: subscriptionPaymentFailedEmail },
};

export function resolveTemplate(
  key: TemplateKey,
  channel: Channel,
): TemplateFn<unknown> {
  const bucket = TEMPLATES[key];
  const fn = bucket?.[channel];
  if (!fn) {
    throw new Error(`no template for ${key} on ${channel}`);
  }
  return fn as TemplateFn<unknown>;
}

export function renderTemplate(
  key: TemplateKey,
  channel: Channel,
  data: unknown,
  locale?: "in" | "id",
): RenderedTemplate {
  return resolveTemplate(key, channel)(data, locale);
}
