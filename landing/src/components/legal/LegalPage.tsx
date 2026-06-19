import { type Locale } from "@/data/locale-content";

export interface LegalSection {
  heading: string;
  /** English gloss shown under the heading on the Indonesian locale. */
  headingEn?: string;
  body?: string[];
  list?: string[];
  footnote?: string;
}

export interface LegalContent {
  locale: Locale;
  eyebrow: string;
  title: string;
  /** English gloss shown beside the title on the Indonesian locale. */
  titleEn?: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalPage({ content }: { content: LegalContent }) {
  return (
    <article className="relative min-h-screen pt-28 pb-24">
      {/* Ambient glow so the page isn't a flat dark void — matches /blog */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-gradient-to-b from-primary/[0.06] via-transparent to-transparent"
      />

      <div className="mx-auto max-w-3xl px-6">
        <header className="mb-12 border-b border-white/[0.08] pb-10">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
            {content.eyebrow}
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-5xl text-balance">
            {content.title}
          </h1>
          {content.titleEn && (
            <p className="mt-2 font-display text-lg font-medium text-foreground/45">
              {content.titleEn}
            </p>
          )}
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {content.lastUpdated}
          </p>
          <p className="mt-6 text-[15px] leading-relaxed text-foreground/70 md:text-base">
            {content.intro}
          </p>
        </header>

        <div className="space-y-12">
          {content.sections.map((section) => (
            <section key={section.heading} className="scroll-mt-28">
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">
                {section.heading}
              </h2>
              {section.headingEn && (
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/40">
                  {section.headingEn}
                </p>
              )}

              {section.body?.map((para, i) => (
                <p
                  key={i}
                  className="mt-4 text-[15px] leading-relaxed text-foreground/70"
                >
                  {para}
                </p>
              ))}

              {section.list && (
                <ul className="mt-4 space-y-3">
                  {section.list.map((item, i) => (
                    <li
                      key={i}
                      className="relative pl-5 text-[15px] leading-relaxed text-foreground/70"
                    >
                      <span
                        aria-hidden
                        className="absolute left-0 top-[0.6em] h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary/70"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {section.footnote && (
                <p className="mt-4 rounded-lg border border-primary/15 bg-primary/[0.04] px-4 py-3 text-sm leading-relaxed text-foreground/75">
                  {section.footnote}
                </p>
              )}
            </section>
          ))}
        </div>

        {/* Closing contact strip */}
        <footer className="mt-16 border-t border-white/[0.08] pt-8">
          <p className="text-sm leading-relaxed text-foreground/60">
            {content.locale === "id" ? (
              <>
                Ada pertanyaan? Hubungi kami di{" "}
                <a
                  href="mailto:hello@larinova.com"
                  className="font-medium text-primary transition-colors hover:text-primary/80"
                >
                  hello@larinova.com
                </a>
                .
              </>
            ) : (
              <>
                Questions? Reach us at{" "}
                <a
                  href="mailto:hello@larinova.com"
                  className="font-medium text-primary transition-colors hover:text-primary/80"
                >
                  hello@larinova.com
                </a>
                .
              </>
            )}
          </p>
        </footer>
      </div>
    </article>
  );
}
