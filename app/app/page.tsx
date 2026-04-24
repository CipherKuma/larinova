import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Larinova — Sign in",
  description:
    "Larinova is the AI OPD assistant for Indian doctors. Sign in to record consultations, generate SOAP notes, ICD-10 codes, and signed prescriptions.",
  alternates: {
    canonical: "https://app.larinova.com/",
  },
};

/**
 * Root app landing (`/`). Renders sign-in / sign-up entry directly at 200 so
 * payment-gateway verifiers (Razorpay) and SEO crawlers fetch the submitted
 * URL without following a locale redirect. Authenticated product flows still
 * live under /in/* and /id/*.
 */
export default function RootPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <header className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Larinova
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            AI OPD assistant — SOAP notes, ICD-10 codes, and prescriptions in
            Tamil, Hindi, English, or code-mixed.
          </p>
        </header>

        <div className="flex flex-col gap-3">
          <Link
            href="/in/sign-in"
            className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 transition"
          >
            Sign in
          </Link>
          <Link
            href="/in/sign-up"
            className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 font-medium hover:bg-secondary transition"
          >
            Create an account
          </Link>
        </div>

        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>
            <Link href="/in" className="underline">
              India (English)
            </Link>
            {" · "}
            <Link href="/id" className="underline">
              Indonesia (Bahasa)
            </Link>
          </p>
          <p>
            <a href="https://larinova.com" className="underline">
              About Larinova
            </a>
            {" · "}
            <a href="mailto:hello@larinova.com" className="underline">
              hello@larinova.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
