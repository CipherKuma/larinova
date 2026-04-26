"use client";

import Image from "next/image";
import { type Locale, content as localeContent } from "@/data/locale-content";

interface FinalCTAProps {
  locale: Locale;
}

export function FinalCTA({ locale }: FinalCTAProps) {
  const c = localeContent[locale].finalCta;

  return (
    <section className="relative overflow-hidden py-32 bg-background">
      <Image
        src="/images/doctor-smiling.jpg"
        alt=""
        fill
        className="object-cover opacity-[0.08]"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,15,30,1) 0%, rgba(10,15,30,0.6) 50%, rgba(10,15,30,1) 100%), radial-gradient(ellipse at 50% 60%, rgba(16,185,129,0.12) 0%, transparent 50%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h2 className="mb-6 font-display text-3xl font-bold text-foreground md:text-5xl">
          {c.headline}
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
          {c.body}
        </p>
        <a
          href={`/${locale}/discovery-survey`}
          className="inline-block rounded-full bg-primary px-10 py-4 text-base font-semibold text-primary-foreground transition-all hover:brightness-110"
        >
          {c.cta}
        </a>
        <p className="mt-5 font-mono text-xs text-muted-foreground">{c.note}</p>
      </div>
    </section>
  );
}
