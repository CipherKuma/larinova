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
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden bg-background"
    >
      <Image
        src="/images/paperwork.jpg"
        alt=""
        fill
        className="object-cover opacity-[0.06] grayscale"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <h2 className="mb-20 text-center font-display text-3xl font-bold text-foreground md:text-4xl">
          {c.headline} <span className="text-gradient">{c.headlineAccent}</span>{" "}
          {c.headlinePost}
        </h2>

        <div className="grid gap-16 md:grid-cols-3 md:gap-8">
          {c.stats.map((stat, i) => {
            const Icon = ICONS[i];
            return (
              <div key={stat.value} className="stat-item text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="font-display text-5xl font-bold text-foreground sm:text-6xl md:text-7xl lg:text-[120px] lg:leading-none">
                  {stat.value}
                </div>
                <p className="mt-4 font-mono text-sm text-muted-foreground">
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
