"use client";

import { useRef } from "react";
import { Mic, Languages, FileCheck } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { type Locale, content as localeContent } from "@/data/locale-content";
import { LazyVideo } from "./LazyVideo";

gsap.registerPlugin(ScrollTrigger);

const STEP_ICONS = [Mic, Languages, FileCheck];

interface HowItWorksProps {
  locale: Locale;
}

export function HowItWorks({ locale }: HowItWorksProps) {
  const c = localeContent[locale].howItWorks;
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const steps = sectionRef.current?.querySelectorAll(".step-card");
      if (!steps) return;
      steps.forEach((step) => {
        gsap.fromTo(
          step,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: step,
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
    <section ref={sectionRef} id="how-it-works" className="relative py-32">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 30%, rgba(16,185,129,0.04) 0%, transparent 50%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-20 text-center">
          <span className="mb-4 inline-block font-mono text-xs uppercase tracking-widest text-primary">
            {c.sectionLabel}
          </span>
          <h2 className="font-display text-3xl font-bold text-foreground md:text-5xl">
            {c.headlinePre}
            <br />
            <span className="text-gradient">{c.headlineAccent}</span>
          </h2>
        </div>

        <div className="space-y-8">
          {c.steps.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <div
                key={step.num}
                className="step-card overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm"
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="relative w-full overflow-hidden lg:w-[40%]">
                    <LazyVideo
                      src={step.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-full w-full min-h-[220px]"
                    />
                    <div className="absolute inset-0 hidden bg-gradient-to-r from-transparent to-card/80 lg:block" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80 lg:hidden" />
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-8 md:p-10">
                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-sm text-primary/40">
                          {step.num}
                        </span>
                        <h3 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                          {step.verb}
                        </h3>
                      </div>
                    </div>
                    <p className="mb-3 text-[15px] leading-relaxed text-muted-foreground">
                      {step.desc}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground/60">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
