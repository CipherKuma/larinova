"use client";

import { Shield, Server, Lock, Eye } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { type Locale, content as localeContent } from "@/data/locale-content";

gsap.registerPlugin(ScrollTrigger);

const TRUST_ICONS = [Shield, Server, Lock, Eye];

interface TrustProps {
  locale: Locale;
}

export function Trust({ locale }: TrustProps) {
  const c = localeContent[locale].trust;
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const items = sectionRef.current?.querySelectorAll(".trust-item");
      if (!items) return;
      items.forEach((item, i) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: i * 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block font-mono text-xs uppercase tracking-widest text-primary">
            {c.sectionLabel}
          </span>
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            {c.headline}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {c.items.map((item, i) => {
            const Icon = TRUST_ICONS[i];
            return (
              <div
                key={item.title}
                className="trust-item flex gap-4 rounded-xl border border-white/[0.06] bg-card/30 p-6"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
