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
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Ambient emerald glow — mirrors FinalCTA / DiscoveryForm */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-primary/10 rounded-full blur-[140px]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="group">
              <div className="flex items-center gap-2 transform group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/larinova-icon.png"
                  alt="Larinova"
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                  priority
                />
                <span className="text-xl font-semibold text-foreground tracking-tight">
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
      <main className="relative pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
              Book a <span className="text-gradient">Discovery Call</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Schedule a free 30-minute call to discuss how Larinova can help
              streamline your clinical documentation workflow.
            </p>
          </div>

          {/* Cal.com Embed */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-2xl shadow-primary/5">
            <iframe
              src="https://cal.com/gabrielaxy/larinova?embed=true&theme=dark"
              width="100%"
              height="700"
              frameBorder="0"
              title="Book a call with Larinova"
              className="w-full"
            />
          </div>

          {/* Trust indicators */}
          <div className="mt-12 text-center">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-5">
              What to expect from this call
            </p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-primary"
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
                  className="w-5 h-5 text-primary"
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
                <span>Q&amp;A session</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-primary"
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
