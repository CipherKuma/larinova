"use client";

import { useRef } from "react";
import Image from "next/image";
import { Clock, Globe, BotOff } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { type Locale, content as localeContent } from "@/data/locale-content";

gsap.registerPlugin(ScrollTrigger);

const ICONS = [Clock, Globe, BotOff];

interface ProblemProps {
  locale: Locale;
}

export function Problem({ locale }: ProblemProps) {
  const c = localeContent[locale].problem;
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = sectionRef.current?.querySelectorAll(".stat-item");
        if (!items) return;
        items.forEach((item, i) => {
          gsap.fromTo(
            item,
            { opacity: 0, y: 60 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: item,
                start: "top 85%",
                toggleActions: "play none none none",
              },
              delay: i * 0.15,
            },
          );
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-background py-24 sm:py-28 md:py-32"
    >
      <Image
        src="/images/paperwork.jpg"
        alt=""
        fill
        className="object-cover opacity-[0.06] grayscale"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <h2 className="mb-16 text-balance text-center font-display text-3xl font-bold leading-[1.08] tracking-[-0.02em] text-foreground sm:mb-20 sm:text-4xl md:text-5xl lg:text-[3.5rem]">
          {c.headline} <span className="text-gradient">{c.headlineAccent}</span>{" "}
          {c.headlinePost}
        </h2>

        <div className="grid gap-14 sm:grid-cols-3 sm:gap-8">
          {c.stats.map((stat, i) => {
            const Icon = ICONS[i];
            return (
              <div key={stat.value} className="stat-item text-center">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="font-display text-6xl font-bold leading-[0.95] tracking-[-0.03em] text-foreground sm:text-7xl md:text-[88px] lg:text-[112px]">
                  {stat.value}
                </div>
                <p className="mx-auto mt-5 max-w-[24ch] font-mono text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
