"use client";

import { useRouter } from "@/src/i18n/routing";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

/**
 * Floating action button on the patient detail page. Scopes the existing
 * assistant chat to a specific patient via `?patient=<id>` query param.
 */
export function AskAIFab({ patientId }: { patientId: string }) {
  const router = useRouter();
  const t = useTranslations("patients");
  return (
    <button
      type="button"
      onClick={() => router.push(`/?ask=${patientId}`)}
      className="fixed right-4 md:right-6 bottom-[calc(72px+env(safe-area-inset-bottom))] md:bottom-6 z-30 flex items-center gap-2 rounded-full bg-primary px-4 md:px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:shadow-xl transition-shadow min-h-[48px]"
      aria-label={t("askAiAboutPatient")}
    >
      <Sparkles className="h-4 w-4" />
      <span className="hidden sm:inline">{t("askAiAboutPatient")}</span>
      <span className="sm:hidden">{t("askAi")}</span>
    </button>
  );
}
