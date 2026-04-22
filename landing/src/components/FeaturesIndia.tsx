"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { type Locale, content as localeContent } from "@/data/locale-content";
import { PhaseVisualBook } from "./features-india/PhaseVisualBook";
import { PhaseVisualIntake } from "./features-india/PhaseVisualIntake";
import { PhaseVisualPrep } from "./features-india/PhaseVisualPrep";
import { PhaseVisualConsult } from "./features-india/PhaseVisualConsult";
import { PhaseVisualFollowUp } from "./features-india/PhaseVisualFollowUp";

gsap.registerPlugin(ScrollTrigger);

const VISUALS = [
  PhaseVisualBook,
  PhaseVisualIntake,
  PhaseVisualPrep,
  PhaseVisualConsult,
  PhaseVisualFollowUp,
];

interface FeaturesIndiaProps {
  locale: Locale;
}

export function FeaturesIndia({ locale }: FeaturesIndiaProps) {
  const opd = localeContent[locale].opd;
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!opd) return;
      const rows = sectionRef.current?.querySelectorAll(".phase-row");
      if (!rows) return;
      rows.forEach((row) => {
        const line = row.querySelector(".phase-line");
        const num = row.querySelector(".phase-num");
        const label = row.querySelector(".phase-label");
        const verb = row.querySelector(".phase-verb");
        const noun = row.querySelector(".phase-noun");
        const desc = row.querySelector(".phase-desc");
        const visual = row.querySelector(".phase-visual");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: row,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        });
        if (line)
          tl.fromTo(
            line,
            { scaleX: 0, transformOrigin: "left" },
            { scaleX: 1, duration: 0.6, ease: "power3.out" },
          );
        if (num)
          tl.fromTo(
            num,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
            "-=0.3",
          );
        if (label)
          tl.fromTo(
            label,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
            "-=0.3",
          );
        if (verb)
          tl.fromTo(
            verb,
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
            "-=0.2",
          );
        if (noun)
          tl.fromTo(
            noun,
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
            "-=0.5",
          );
        if (desc)
          tl.fromTo(
            desc,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
            "-=0.4",
          );
        if (visual)
          tl.fromTo(
            visual,
            { opacity: 0, y: 32, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
            "-=0.6",
          );
      });
    },
    { scope: sectionRef, dependencies: [opd] },
  );

  if (!opd) return null;
  const { features } = opd;

  return (
    <section
      ref={sectionRef}
      id="opd-journey"
      className="relative bg-background"
    >
      {/* Section intro */}
      <div className="relative mx-auto max-w-5xl px-6 pt-28 pb-20 text-center">
        <span className="mb-5 inline-block font-mono text-xs uppercase tracking-widest text-primary">
          {features.sectionLabel}
        </span>
        <h2 className="font-display text-3xl font-bold leading-[1.1] text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
          {features.headlinePre}
          <br />
          <span className="text-gradient">{features.headlineAccent}</span>
        </h2>
      </div>

      {/* Phases — one viewport each, alternating */}
      <div>
        {features.phases.map((phase, i) => {
          const Visual = VISUALS[i] ?? VISUALS[VISUALS.length - 1];
          const reversed = i % 2 !== 0;
          return (
            <div
              key={phase.num}
              className="phase-row relative flex min-h-screen items-center px-6 py-20"
            >
              <div
                className={`mx-auto flex w-full max-w-6xl flex-col items-center gap-10 lg:gap-20 ${
                  reversed ? "lg:flex-row-reverse" : "lg:flex-row"
                }`}
              >
                {/* Text column */}
                <div className="flex-1 space-y-5 lg:max-w-xl">
                  <div
                    className="phase-line h-[2px] w-24"
                    style={{
                      backgroundColor: phase.accent,
                      transform: "scaleX(0)",
                      transformOrigin: "left",
                    }}
                  />
                  <div className="flex items-center gap-3">
                    <span
                      className="phase-num font-mono text-sm font-bold"
                      style={{ color: phase.accent, opacity: 0 }}
                    >
                      {phase.num}
                    </span>
                    <span
                      className="phase-label font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground"
                      style={{ opacity: 0 }}
                    >
                      {phase.label}
                    </span>
                  </div>
                  <h3 className="font-display text-3xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-4xl md:text-5xl">
                    <span className="phase-verb block" style={{ opacity: 0 }}>
                      {phase.verb}
                    </span>
                    <span
                      className="phase-noun block"
                      style={{ color: phase.accent, opacity: 0 }}
                    >
                      {phase.noun}
                    </span>
                  </h3>
                  <p
                    className="phase-desc max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg"
                    style={{ opacity: 0 }}
                  >
                    {phase.desc}
                  </p>
                </div>

                {/* Visual column */}
                <div
                  className="phase-visual flex flex-1 justify-center lg:max-w-xl"
                  style={{ opacity: 0 }}
                >
                  <Visual />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
