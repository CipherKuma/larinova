"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  type Locale,
  type FeaturePreviewData,
  content as localeContent,
} from "@/data/locale-content";

gsap.registerPlugin(ScrollTrigger);

interface FeaturePreviewProps {
  type: string;
  transcriptionLines: { s: string; t: string }[];
  previewData: FeaturePreviewData;
}

function FeaturePreview({
  type,
  transcriptionLines,
  previewData,
}: FeaturePreviewProps) {
  if (type === "transcription") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-primary">
          <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <span className="font-mono">{previewData.transcriptionLabel}</span>
        </div>
        {transcriptionLines.map((l, i) => (
          <div key={i} className="text-sm">
            <span
              className={`font-mono text-xs ${l.s === "Dr" ? "text-primary" : "text-amber-400"}`}
            >
              {l.s}:
            </span>{" "}
            <span className="text-foreground/70">{l.t}</span>
          </div>
        ))}
      </div>
    );
  }
  if (type === "soap") {
    return (
      <div className="space-y-1.5">
        {previewData.soapPreview.map((s) => (
          <div key={s.k} className="text-sm">
            <span className="font-mono font-bold text-primary">{s.k}: </span>
            <span className="text-foreground/70">{s.v}</span>
          </div>
        ))}
      </div>
    );
  }
  if (type === "coding") {
    return (
      <div className="space-y-2">
        {previewData.codingPreview.map((c) => (
          <div
            key={c.code}
            className="flex items-center justify-between text-sm"
          >
            <div>
              <span className="font-mono text-primary">{c.code}</span>{" "}
              <span className="text-foreground/60">{c.label}</span>
            </div>
            <span className="font-mono text-xs text-primary/60">{c.conf}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {previewData.prescriptionPreview.map((m) => (
        <div
          key={m.med}
          className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
        >
          <div>
            <div className="font-medium text-foreground/90">{m.med}</div>
            <div className="font-mono text-xs text-muted-foreground">
              {m.dose} x {m.dur}
            </div>
          </div>
          <div className="h-2 w-2 rounded-full bg-primary/40" />
        </div>
      ))}
    </div>
  );
}

interface FeaturesProps {
  locale: Locale;
}

export function Features({ locale }: FeaturesProps) {
  const c = localeContent[locale].features;
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const items = sectionRef.current?.querySelectorAll(".feature-row");
      if (!items) return;
      items.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="features" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
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

        <div className="space-y-20">
          {c.features.map((feat, i) => {
            const reversed = i % 2 !== 0;
            return (
              <div
                key={feat.title}
                className={`feature-row flex flex-col items-center gap-10 lg:gap-16 ${
                  reversed ? "lg:flex-row-reverse" : "lg:flex-row"
                }`}
              >
                <div className="flex-1">
                  <span className="mb-2 inline-block font-mono text-xs uppercase tracking-widest text-primary/60">
                    {feat.title}
                  </span>
                  <h3 className="mb-4 font-display text-2xl font-bold text-foreground md:text-3xl">
                    {feat.headline}
                  </h3>
                  <p className="mb-5 text-muted-foreground leading-relaxed">
                    {feat.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {feat.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border bg-card/50 px-3 py-1 font-mono text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="w-full max-w-md flex-1 rounded-xl border border-border bg-card/50 p-6">
                  <FeaturePreview
                    type={feat.preview}
                    transcriptionLines={c.transcriptionLines}
                    previewData={c.previewData}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
