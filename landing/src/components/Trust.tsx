"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  type Locale,
  type TrustItem,
  content as localeContent,
} from "@/data/locale-content";

gsap.registerPlugin(ScrollTrigger);

interface TrustProps {
  locale: Locale;
}

export function Trust({ locale }: TrustProps) {
  const c = localeContent[locale].trust;
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const rows = sectionRef.current?.querySelectorAll(".trust-row");
      if (!rows) return;
      rows.forEach((row) => {
        const line = row.querySelector(".trust-line");
        const num = row.querySelector(".trust-num");
        const label = row.querySelector(".trust-label");
        const verb = row.querySelector(".trust-verb");
        const noun = row.querySelector(".trust-noun");
        const desc = row.querySelector(".trust-desc");
        const visual = row.querySelector(".trust-visual");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: row,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
        if (line)
          tl.fromTo(
            line,
            { scaleX: 0, transformOrigin: "left" },
            { scaleX: 1, duration: 0.5, ease: "power3.out" },
          );
        if (num)
          tl.fromTo(
            num,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.35 },
            "-=0.25",
          );
        if (label)
          tl.fromTo(
            label,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.35 },
            "-=0.25",
          );
        if (verb)
          tl.fromTo(
            verb,
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.55 },
            "-=0.15",
          );
        if (noun)
          tl.fromTo(
            noun,
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.55 },
            "-=0.4",
          );
        if (desc)
          tl.fromTo(
            desc,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.45 },
            "-=0.35",
          );
        if (visual)
          tl.fromTo(
            visual,
            { opacity: 0, y: 26, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.7 },
            "-=0.5",
          );
      });
    },
    { scope: sectionRef, dependencies: [c] },
  );

  return (
    <section ref={sectionRef} id="trust" className="relative">
      <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-2 text-center">
        <span className="mb-4 inline-block font-mono text-xs uppercase tracking-widest text-primary">
          {c.sectionLabel}
        </span>
        <h2 className="mx-auto max-w-3xl text-balance font-display text-3xl font-bold leading-[1.1] text-foreground sm:text-4xl md:text-5xl">
          {c.headline}
        </h2>
      </div>

      <div>
        {c.items.map((item, i) => {
          const reversed = i % 2 !== 0;
          const accent = item.accent ?? "#10b981";
          return (
            <div
              key={item.title}
              className="trust-row relative flex items-center px-6 py-12 md:py-16"
            >
              <div
                className={`mx-auto flex w-full max-w-6xl flex-col items-center gap-10 lg:gap-20 ${
                  reversed ? "lg:flex-row-reverse" : "lg:flex-row"
                }`}
              >
                <div className="flex-1 space-y-4 lg:max-w-xl">
                  <div
                    className="trust-line h-[2px] w-20"
                    style={{
                      backgroundColor: accent,
                      transform: "scaleX(0)",
                      transformOrigin: "left",
                    }}
                  />
                  <div className="flex items-center gap-3">
                    {item.num && (
                      <span
                        className="trust-num font-mono text-sm font-bold"
                        style={{ color: accent, opacity: 0 }}
                      >
                        {item.num}
                      </span>
                    )}
                    {item.label && (
                      <span
                        className="trust-label font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground"
                        style={{ opacity: 0 }}
                      >
                        {item.label}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-2xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-3xl md:text-4xl">
                    {item.verb ? (
                      <>
                        <span
                          className="trust-verb block"
                          style={{ opacity: 0 }}
                        >
                          {item.verb}
                        </span>
                        <span
                          className="trust-noun block"
                          style={{ color: accent, opacity: 0 }}
                        >
                          {item.noun ?? ""}
                        </span>
                      </>
                    ) : (
                      <span className="trust-verb block" style={{ opacity: 0 }}>
                        {item.title}
                      </span>
                    )}
                  </h3>
                  <p
                    className="trust-desc max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg"
                    style={{ opacity: 0 }}
                  >
                    {item.desc}
                  </p>
                </div>

                <div
                  className="trust-visual flex flex-1 justify-center lg:max-w-xl"
                  style={{ opacity: 0 }}
                >
                  <TrustVisual kind={item.visual} accent={accent} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TrustVisual({
  kind,
  accent,
}: {
  kind?: TrustItem["visual"];
  accent: string;
}) {
  if (kind === "no-sale") return <NoSaleVisual accent={accent} />;
  if (kind === "india-servers") return <IndiaServersVisual accent={accent} />;
  if (kind === "encryption") return <EncryptionVisual accent={accent} />;
  if (kind === "doctor-final") return <DoctorFinalVisual accent={accent} />;
  return null;
}

function NoSaleVisual({ accent }: { accent: string }) {
  const rows: { k: string; v: string }[] = [
    { k: "advertising", v: "DENIED" },
    { k: "third_party_share", v: "DENIED" },
    { k: "ai_training", v: "DENIED" },
    { k: "analytics_resale", v: "DENIED" },
  ];
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card/50 p-5 font-mono text-xs shadow-[0_20px_60px_-20px_rgba(16,185,129,0.18)] backdrop-blur">
      <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: accent }}
        />
        patient_data.policy
      </div>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div
            key={r.k}
            className="flex items-baseline justify-between border-b border-border/50 py-1.5 last:border-0"
          >
            <span className="text-muted-foreground">{r.k}</span>
            <span
              className="font-bold tracking-wider"
              style={{ color: accent }}
            >
              {r.v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IndiaServersVisual({ accent }: { accent: string }) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card/50 p-6 shadow-[0_20px_60px_-20px_rgba(14,165,233,0.18)] backdrop-blur">
      <svg viewBox="0 0 200 220" className="mx-auto h-44 w-auto">
        <path
          d="M58 30 L120 22 L155 60 L168 110 L150 165 L100 200 L60 175 L40 130 L35 80 Z"
          fill="none"
          stroke={accent}
          strokeWidth="1.5"
          opacity="0.6"
        />
        <circle cx="78" cy="120" r="4" fill={accent}>
          <animate
            attributeName="r"
            values="4;9;4"
            dur="2.4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="1;0.2;1"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="78" cy="120" r="2" fill={accent} />
      </svg>
      <div className="mt-3 flex items-center justify-between gap-3 font-mono text-[11px]">
        <span className="text-muted-foreground">region</span>
        <span style={{ color: accent }} className="truncate">
          ap-south-1 · Mumbai
        </span>
      </div>
    </div>
  );
}

function EncryptionVisual({ accent }: { accent: string }) {
  const lines = [
    "[10:42:18] consult_4521 · key_rotated",
    "[10:42:19] note_signed · dr.priya@larinova",
    "[10:42:21] export_pdf · access_logged",
    "[10:43:02] rx_dispatched · email_sent",
  ];
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card/50 p-5 shadow-[0_20px_60px_-20px_rgba(168,85,247,0.18)] backdrop-blur">
      <div className="mb-3 flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}1a` }}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accent}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="11" width="16" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          AES-256 · TLS 1.3
        </div>
      </div>
      <div className="space-y-1 font-mono text-[10.5px] leading-relaxed text-muted-foreground">
        {lines.map((l) => (
          <div key={l} className="truncate">
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

function DoctorFinalVisual({ accent }: { accent: string }) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card/50 p-5 shadow-[0_20px_60px_-20px_rgba(245,158,11,0.18)] backdrop-blur">
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        <span>SOAP · Ravi Kumar, 52</span>
        <span
          className="rounded-full border px-2 py-0.5 text-[9px]"
          style={{ borderColor: `${accent}66`, color: accent }}
        >
          DRAFT · AI
        </span>
      </div>
      <div className="space-y-2 text-[12.5px] leading-relaxed text-muted-foreground">
        <div>
          <span className="font-mono text-[10px] text-foreground">A:</span>{" "}
          Acute febrile illness — rule out dengue.
        </div>
        <div>
          <span className="font-mono text-[10px] text-foreground">P:</span>{" "}
          Paracetamol 500mg TDS × 3d · CBC + NS1 today.
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke={accent}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <span className="text-[12px] text-foreground">
          Signed by{" "}
          <span style={{ color: accent }} className="font-medium">
            Dr. Priya Iyer
          </span>
        </span>
      </div>
    </div>
  );
}
