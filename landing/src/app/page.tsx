import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Larinova — AI OPD assistant for Indian doctors",
  description:
    "Record in Tamil, Hindi, English or code-mixed. Get SOAP notes, ICD-10 codes, and signed prescriptions before your patient stands up.",
  alternates: {
    canonical: "https://larinova.com/",
    languages: {
      "en-IN": "https://larinova.com/in",
      "id-ID": "https://larinova.com/id",
    },
  },
};

/**
 * Root landing page (`/`). Renders 200 OK with actual content so that
 * payment-gateway verifiers (Razorpay, etc.) and search engines can fetch
 * a real homepage instead of a redirect. Users on this page see an overview
 * with CTAs to India / Indonesia locales and sign-in.
 *
 * Previously this file did `redirect("/in")` which failed Razorpay's
 * "website link verification" because the verifier won't follow 307s.
 */
export default function RootLandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-8">
        <header className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Larinova
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            AI OPD assistant for Indian doctors
          </p>
        </header>

        <p className="text-lg text-muted-foreground leading-relaxed">
          See more patients. Type less. Send prescriptions on WhatsApp.
          Transcribes Tamil, Hindi, English and code-mixed consultations into
          SOAP notes, ICD-10 codes, and signed prescriptions.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/in"
            className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 transition"
          >
            India (English)
          </Link>
          <Link
            href="/id"
            className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 font-medium hover:bg-secondary transition"
          >
            Indonesia (Bahasa)
          </Link>
          <Link
            href="https://app.larinova.com/in/signup"
            className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 font-medium hover:bg-secondary transition"
          >
            Sign in
          </Link>
        </div>

        <footer className="pt-8 text-sm text-muted-foreground space-y-1">
          <p>Contact: hello@larinova.com</p>
          <p>
            <Link href="/in#privacy" className="underline">
              Privacy
            </Link>
            {" · "}
            <Link href="/in#terms" className="underline">
              Terms
            </Link>
            {" · "}
            <Link href="/in" className="underline">
              About
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
