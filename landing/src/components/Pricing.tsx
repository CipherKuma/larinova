"use client";

import { useRef } from "react";
import { Check } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { type Locale, content as localeContent } from "@/data/locale-content";

gsap.registerPlugin(ScrollTrigger);

interface PricingProps {
  locale: Locale;
}

export function Pricing({ locale }: PricingProps) {
  const c = localeContent[locale].pricing;
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const cards = sectionRef.current?.querySelectorAll(".pricing-card");
      if (!cards) return;
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="pricing" className="relative py-32">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block font-mono text-xs uppercase tracking-widest text-primary">
            {c.sectionLabel}
          </span>
          <h2 className="font-display text-3xl font-bold text-foreground md:text-5xl">
            {c.headlinePre}{" "}
            <span className="text-gradient">{c.headlineAccent}</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Free tier */}
          <div className="pricing-card rounded-2xl border border-border bg-card/50 p-8">
            <h3 className="mb-2 font-display text-xl font-bold text-foreground">
              {c.free.name}
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              {c.free.subtitle}
            </p>
            <div className="mb-6">
              <span className="font-display text-4xl font-bold text-foreground">
                {c.free.price}
              </span>
              <span className="ml-2 text-sm text-muted-foreground">
                {c.free.period}
              </span>
            </div>
            <ul className="mb-8 space-y-3 text-sm text-muted-foreground">
              {c.free.features.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="https://app.larinova.com"
              className="block w-full rounded-full border border-border py-3 text-center text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:text-primary"
            >
              {c.free.cta}
            </a>
          </div>

          {/* Pro tier */}
          <div className="pricing-card relative rounded-2xl border border-primary/40 bg-card/50 p-8">
            {c.pro.badge && (
              <div className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                {c.pro.badge}
              </div>
            )}
            <h3 className="mb-2 font-display text-xl font-bold text-foreground">
              {c.pro.name}
            </h3>
            <p className="mb-6 text-sm text-primary">{c.pro.subtitle}</p>
            <div className="mb-6">
              {c.pro.originalPrice && (
                <span className="mr-2 text-lg text-muted-foreground line-through">
                  {c.pro.originalPrice}
                </span>
              )}
              <span className="font-display text-4xl font-bold text-foreground">
                {c.pro.price}
              </span>
              {c.pro.period && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {c.pro.period}
                </span>
              )}
            </div>
            <ul className="mb-8 space-y-3 text-sm text-muted-foreground">
              {c.pro.features.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="https://app.larinova.com"
              className="block w-full rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
            >
              {c.pro.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
