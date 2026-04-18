"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { TranscriptionDemo } from "./TranscriptionDemo";
import { type Locale, content as localeContent } from "@/data/locale-content";

interface HeroProps {
  locale: Locale;
}

export function Hero({ locale }: HeroProps) {
  const c = localeContent[locale].hero;
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLSpanElement>(null);
  const [langIndex, setLangIndex] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const onVideoLoaded = useCallback(() => setVideoLoaded(true), []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = headlineRef.current?.querySelectorAll(".word");
      if (words) {
        gsap.fromTo(
          words,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.04,
            ease: "power4.out",
          },
        );
      }
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: "power3.out" },
      );
      gsap.fromTo(
        demoRef.current,
        { opacity: 0, x: 40, scale: 0.98 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 1,
          delay: 0.3,
          ease: "power3.out",
        },
      );
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (langRef.current) {
        gsap.to(langRef.current, {
          opacity: 0,
          y: -10,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            setLangIndex((prev) => (prev + 1) % c.languages.length);
            if (langRef.current) {
              gsap.fromTo(
                langRef.current,
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
              );
            }
          },
        });
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [c.languages.length]);

  return (
    <section className="relative min-h-screen overflow-hidden pt-28 pb-20">
      {/* Shimmer placeholder while hero video loads */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-background to-background transition-opacity duration-700 ${videoLoaded ? "opacity-0" : "opacity-100"}`}
        aria-hidden
      >
        <div className="h-full w-full animate-pulse bg-white/[0.02]" />
      </div>

      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedData={onVideoLoaded}
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.3] transition-opacity duration-700 ${videoLoaded ? "opacity-[0.3]" : "opacity-0"}`}
      >
        <source src={c.heroVideo} type="video/mp4" />
      </video>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(10,15,30,0.9) 0%, rgba(10,15,30,0.5) 50%, rgba(10,15,30,0.9) 100%), linear-gradient(to bottom, rgba(10,15,30,0.2) 0%, rgba(10,15,30,0.85) 100%), radial-gradient(ellipse at 30% 50%, rgba(16,185,129,0.07) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex-1 lg:max-w-[55%]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
            <span className="font-mono text-[10px] text-muted-foreground">
              {c.poweredByText}
            </span>
            {c.provider === "sarvam" ? (
              <Image
                src="/sarvam-wordmark.svg"
                alt="Sarvam AI"
                width={56}
                height={9}
                className="h-2.5 w-auto opacity-80"
              />
            ) : (
              <span className="font-mono text-[11px] font-semibold text-primary/80">
                Deepgram
              </span>
            )}
          </div>

          <h1
            ref={headlineRef}
            className="mb-6 font-display text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-7xl"
          >
            {c.headline.split(" ").map((word, i) => {
              if (word === c.languageTriggerWord) {
                return (
                  <span
                    key={i}
                    className="word inline-block"
                    style={{ opacity: 0 }}
                  >
                    <span ref={langRef} className="text-primary">
                      {c.languages[langIndex]}.
                    </span>
                    {"\u00A0"}
                  </span>
                );
              }
              return (
                <span
                  key={i}
                  className="word inline-block"
                  style={{ opacity: 0 }}
                >
                  {word}
                  {i < c.headline.split(" ").length - 1 ? "\u00A0" : ""}
                </span>
              );
            })}
          </h1>

          <div ref={contentRef} style={{ opacity: 0 }}>
            <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
              {c.subtitle}
            </p>

            <div className="mb-8 flex flex-wrap gap-3">
              <a
                href="https://app.larinova.com"
                className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
              >
                {c.ctaPrimary}
              </a>
              <a
                href="#how-it-works"
                className="rounded-full border border-border px-7 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:text-primary"
              >
                {c.ctaSecondary}
              </a>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted-foreground">
              {c.featureTags.map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <span className="text-primary/60">/</span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          ref={demoRef}
          className="flex-1 lg:max-w-[45%]"
          style={{ opacity: 0 }}
        >
          <TranscriptionDemo locale={locale} />
        </div>
      </div>
    </section>
  );
}
