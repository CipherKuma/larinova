"use client";

import Image from "next/image";
import { type Locale, content as localeContent } from "@/data/locale-content";

interface FooterProps {
  locale: Locale;
}

export function Footer({ locale }: FooterProps) {
  const c = localeContent[locale].footer;

  return (
    <footer className="border-t border-border py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row">
          <div>
            <div className="flex items-center gap-2 mb-3">
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
            <p className="max-w-xs text-sm text-muted-foreground">
              {c.description}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
              <span className="font-mono text-[10px] text-muted-foreground">
                {c.poweredByText}
              </span>
              {c.provider === "sarvam" ? (
                <Image
                  src="/sarvam-wordmark.svg"
                  alt="Sarvam AI"
                  width={48}
                  height={8}
                  className="h-2 w-auto opacity-70"
                />
              ) : (
                <span className="font-mono text-[11px] font-semibold text-primary/80">
                  Deepgram
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-16">
            <div>
              <h4 className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {c.sections.product}
              </h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a
                    href="#features"
                    className="transition-colors hover:text-foreground"
                  >
                    {c.links.features}
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="transition-colors hover:text-foreground"
                  >
                    {c.links.pricing}
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="transition-colors hover:text-foreground"
                  >
                    {c.links.howItWorks}
                  </a>
                </li>
                <li>
                  <a
                    href="/blog"
                    className="transition-colors hover:text-foreground"
                  >
                    {c.links.blog}
                  </a>
                </li>
                <li>
                  <a
                    href={`/${locale}/discovery-survey`}
                    className="transition-colors hover:text-foreground"
                  >
                    {locale === "id" ? "Survei Dokter" : "Doctor Survey"}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {c.sections.company}
              </h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a
                    href="#features"
                    className="transition-colors hover:text-foreground"
                  >
                    {c.links.about}
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:hello@larinova.com"
                    className="transition-colors hover:text-foreground"
                  >
                    {c.links.contact}
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="transition-colors hover:text-foreground"
                  >
                    {c.links.privacy}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center font-mono text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Larinova. {c.copyright}
        </div>
      </div>
    </footer>
  );
}
