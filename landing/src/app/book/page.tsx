import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Book a Discovery Call",
  description:
    "Schedule a free 30-minute call to see how Larinova can streamline your clinical documentation workflow.",
  alternates: { canonical: "https://larinova.com/book" },
};

export default function BookPage() {
  return (
    <div className="min-h-screen bg-gradient-mesh bg-medical-grid">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="group">
              <div className="flex items-center gap-2 transform group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/larinova-icon.png"
                  alt="Larinova"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
                <span className="text-lg font-semibold text-white tracking-tight">
                  Larinova
                </span>
              </div>
            </Link>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Book a <span className="text-gradient">Discovery Call</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Schedule a free 30-minute call to discuss how Larinova can help
              streamline your clinical documentation workflow.
            </p>
          </div>

          {/* Cal.com Embed */}
          <div className="bg-white rounded-2xl shadow-xl border border-border/50 overflow-hidden">
            <iframe
              src="https://cal.com/gabrielaxy/larinova?embed=true&theme=light"
              width="100%"
              height="700"
              frameBorder="0"
              title="Book a call with Larinova"
              className="w-full"
            />
          </div>

          {/* Trust indicators */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              What to expect from this call:
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Personalized demo</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Q&A session</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>No obligation</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
