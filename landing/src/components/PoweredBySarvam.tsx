"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { type Locale, content as localeContent } from "@/data/locale-content";

gsap.registerPlugin(ScrollTrigger);

interface PoweredBySarvamProps {
  locale: Locale;
}

export function PoweredBySarvam({ locale }: PoweredBySarvamProps) {
  const c = localeContent[locale].poweredBy;
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative py-32 bg-background">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.06) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <span className="mb-4 inline-block font-mono text-xs uppercase tracking-widest text-primary">
          {c.sectionLabel}
        </span>
        <div className="mb-6 flex justify-center">
          {c.provider === "sarvam" ? (
            <Image
              src="/sarvam-logo-white.svg"
              alt="Sarvam AI"
              width={40}
              height={40}
              className="h-10 w-10 opacity-50"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <span className="font-mono text-xs font-bold text-primary">
                DG
              </span>
            </div>
          )}
        </div>
        <h2 className="mb-6 font-display text-3xl font-bold text-foreground md:text-5xl">
          {c.headlinePre}
          <br />
          <span className="text-gradient">{c.headlineAccent}</span>
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground">
          {c.description}
        </p>

        <div className="mb-12 flex flex-wrap justify-center gap-2">
          {c.languages.map((lang) => (
            <span
              key={lang}
              className={`rounded-full border px-4 py-1.5 font-mono text-xs transition-colors ${
                lang === c.highlightLanguage
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {lang}
            </span>
          ))}
          <span className="rounded-full border border-border px-4 py-1.5 font-mono text-xs text-muted-foreground">
            {c.moreCount}
          </span>
        </div>

        <div className="mx-auto flex max-w-xl flex-wrap justify-center gap-8 font-mono text-sm text-muted-foreground">
          {c.stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-lg font-bold text-foreground">{s.val}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
