"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { type Locale, content as localeContent } from "@/data/locale-content";

interface HeroIndiaProps {
  locale: Locale;
}

export function HeroIndia({ locale }: HeroIndiaProps) {
  const opd = localeContent[locale].opd;
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!opd) return;
      const words = headlineRef.current?.querySelectorAll(".word");
      if (words) {
        gsap.fromTo(
          words,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.04,
            ease: "power4.out",
          },
        );
      }
      gsap.fromTo(
        subRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.5, ease: "power3.out" },
      );
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.65, ease: "power3.out" },
      );
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          scale: 1.15,
          opacity: 0.85,
          duration: 4,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      }
      if (ringRef.current) {
        gsap.to(ringRef.current, {
          rotation: 360,
          duration: 60,
          repeat: -1,
          ease: "none",
          transformOrigin: "50% 50%",
        });
      }
    },
    { scope: sectionRef, dependencies: [opd] },
  );

  if (!opd) return null;
  const { hero } = opd;

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-24 pb-16"
    >
      {/* Animated radial gradient glow — breathes behind headline */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "1100px",
          height: "1100px",
          background:
            "radial-gradient(circle at center, rgba(16,185,129,0.22) 0%, rgba(16,185,129,0.08) 28%, transparent 60%)",
          opacity: 0.55,
        }}
      />

      {/* Slow rotating orbital ring — imperceptible motion */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "900px",
          height: "900px",
          border: "1px solid rgba(255,255,255,0.04)",
          boxShadow:
            "inset 0 0 120px rgba(16,185,129,0.06), 0 0 80px rgba(16,185,129,0.04)",
        }}
      />

      {/* Grid lines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        }}
      />

      {/* Noise overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <h1
          ref={headlineRef}
          className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {hero.headline.split(" ").map((word, i) => (
            <span key={i} className="word inline-block" style={{ opacity: 0 }}>
              {word}
              {i < hero.headline.split(" ").length - 1 ? " " : ""}
            </span>
          ))}
        </h1>

        <p
          ref={subRef}
          className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          style={{ opacity: 0 }}
        >
          {hero.sub}
        </p>

        <div
          ref={ctaRef}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
          style={{ opacity: 0 }}
        >
          <a
            href={hero.ctaPrimaryHref}
            className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
          >
            {hero.ctaPrimary}
          </a>
          <a
            href={hero.ctaSecondaryHref}
            className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold text-foreground/80 transition-all hover:border-primary/50 hover:text-primary"
          >
            {hero.ctaSecondary}
          </a>
        </div>
      </div>
    </section>
  );
}
