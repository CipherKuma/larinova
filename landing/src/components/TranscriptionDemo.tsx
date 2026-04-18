"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Mic,
  FileText,
  Stethoscope,
  User,
  Activity,
  Pill,
  FolderHeart,
  Check,
  Send,
  CalendarClock,
} from "lucide-react";
import { type Locale, content as localeContent } from "@/data/locale-content";

type Phase = "recording" | "soap" | "analysis" | "actions";

const PHASES_KEYS: Phase[] = ["recording", "soap", "analysis", "actions"];

const SOAP_COLORS = [
  "text-blue-400",
  "text-emerald-400",
  "text-amber-400",
  "text-primary",
];

interface TranscriptionDemoProps {
  locale: Locale;
}

function WaveformBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[2px]">
      {[14, 20, 10, 24, 16, 12, 22, 8, 18, 14, 20, 10].map((h, i) => (
        <div
          key={i}
          className="w-[2.5px] rounded-full bg-primary/80"
          style={{
            height: h,
            animationName: active ? "waveform" : "none",
            animationDuration: `${0.3 + i * 0.06}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDelay: `${i * 0.04}s`,
            transformOrigin: "bottom",
            opacity: active ? 0.8 : 0.2,
            transition: "opacity 0.3s",
          }}
        />
      ))}
    </div>
  );
}

function PhaseIndicator({ phase }: { phase: Phase }) {
  const currentIdx = PHASES_KEYS.findIndex((p) => p === phase);
  return (
    <div className="flex items-center gap-1">
      {PHASES_KEYS.map((p, i) => (
        <div
          key={p}
          className={`h-1 rounded-full transition-all duration-500 ${
            i <= currentIdx ? "w-5 bg-primary" : "w-2 bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}

export function TranscriptionDemo({ locale }: TranscriptionDemoProps) {
  const c = localeContent[locale].demo;
  const [phase, setPhase] = useState<Phase>("recording");
  const [visibleLines, setVisibleLines] = useState(0);
  const [soapIndex, setSoapIndex] = useState(-1);
  const [analysisIndex, setAnalysisIndex] = useState(-1);
  const [actionIndex, setActionIndex] = useState(-1);
  const [cycle, setCycle] = useState(0);

  const phases = [
    { key: "recording" as Phase, label: c.phaseLabels.recording, icon: Mic },
    { key: "soap" as Phase, label: c.phaseLabels.soap, icon: FileText },
    { key: "analysis" as Phase, label: c.phaseLabels.analysis, icon: Activity },
    {
      key: "actions" as Phase,
      label: c.phaseLabels.actions,
      icon: FolderHeart,
    },
  ];

  const analysisItems = [
    {
      icon: Pill,
      label: c.drugInteraction,
      status: c.drugInteractionStatus,
      color: "text-emerald-400",
    },
    {
      icon: Activity,
      label: c.icdCodes,
      status: c.icdCodesStatus,
      color: "text-blue-400",
    },
    {
      icon: Activity,
      label: c.cardiovascularRisk,
      status: c.cardiovascularRiskStatus,
      color: "text-amber-400",
    },
  ];

  const actionItems = [
    { icon: FileText, label: c.prescriptionGenerated, color: "text-primary" },
    { icon: FolderHeart, label: c.patientRecords, color: "text-blue-400" },
    { icon: Send, label: c.summarySent, color: "text-emerald-400" },
    { icon: CalendarClock, label: c.followUp, color: "text-amber-400" },
  ];

  const reset = useCallback(() => {
    setPhase("recording");
    setVisibleLines(0);
    setSoapIndex(-1);
    setAnalysisIndex(-1);
    setActionIndex(-1);
    setCycle((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const t: NodeJS.Timeout[] = [];

    t.push(setTimeout(() => setVisibleLines(1), 600));
    t.push(setTimeout(() => setVisibleLines(2), 1800));
    t.push(setTimeout(() => setVisibleLines(3), 3000));

    t.push(
      setTimeout(() => {
        setPhase("soap");
        setSoapIndex(0);
      }, 4500),
    );
    t.push(setTimeout(() => setSoapIndex(1), 5200));
    t.push(setTimeout(() => setSoapIndex(2), 5900));
    t.push(setTimeout(() => setSoapIndex(3), 6600));

    t.push(
      setTimeout(() => {
        setPhase("analysis");
        setAnalysisIndex(0);
      }, 8000),
    );
    t.push(setTimeout(() => setAnalysisIndex(1), 8800));
    t.push(setTimeout(() => setAnalysisIndex(2), 9600));

    t.push(
      setTimeout(() => {
        setPhase("actions");
        setActionIndex(0);
      }, 11000),
    );
    t.push(setTimeout(() => setActionIndex(1), 11600));
    t.push(setTimeout(() => setActionIndex(2), 12200));
    t.push(setTimeout(() => setActionIndex(3), 12800));

    t.push(setTimeout(reset, 16000));

    return () => t.forEach(clearTimeout);
  }, [cycle, reset]);

  return (
    <div className="w-full max-w-lg">
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1220] shadow-2xl shadow-primary/5">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0a0e1a] px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
            </div>
            <span className="font-mono text-[11px] text-white/30">
              larinova
            </span>
          </div>
          <PhaseIndicator phase={phase} />
        </div>

        {/* Fixed height content area */}
        <div className="relative h-[320px]">
          {/* Phase 1: Recording */}
          <div
            className="absolute inset-0 px-5 pt-4 transition-all duration-500"
            style={{
              opacity: phase === "recording" ? 1 : 0,
              transform:
                phase === "recording" ? "translateX(0)" : "translateX(-20px)",
              pointerEvents: phase === "recording" ? "auto" : "none",
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-3.5 w-3.5 text-primary/60" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                  {c.liveTranscript}
                </span>
              </div>
              <WaveformBars active={phase === "recording"} />
            </div>
            <div className="space-y-3">
              {c.transcriptionLines.map((line, i) => (
                <div
                  key={`${cycle}-${i}`}
                  className="flex gap-3 transition-all duration-500"
                  style={{
                    opacity: i < visibleLines ? 1 : 0,
                    transform:
                      i < visibleLines ? "translateY(0)" : "translateY(12px)",
                  }}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {line.speaker === "doctor" ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                        <Stethoscope className="h-3 w-3 text-primary" />
                      </div>
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10">
                        <User className="h-3 w-3 text-amber-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        line.speaker === "doctor"
                          ? "text-primary/70"
                          : "text-amber-400/70"
                      }`}
                    >
                      {line.speaker === "doctor"
                        ? c.doctorLabel
                        : c.patientLabel}
                    </span>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-white/75">
                      {line.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 2: SOAP */}
          <div
            className="absolute inset-0 px-5 pt-4 transition-all duration-500"
            style={{
              opacity: phase === "soap" ? 1 : 0,
              transform:
                phase === "soap"
                  ? "translateX(0)"
                  : phase === "recording"
                    ? "translateX(20px)"
                    : "translateX(-20px)",
              pointerEvents: phase === "soap" ? "auto" : "none",
            }}
          >
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-primary/60" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                {c.soapGenerated}
              </span>
            </div>
            <div className="space-y-3">
              {c.soapItems.map((item, i) => (
                <div
                  key={item.key}
                  className="flex gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 transition-all duration-500"
                  style={{
                    opacity: i <= soapIndex ? 1 : 0,
                    transform:
                      i <= soapIndex ? "translateY(0)" : "translateY(10px)",
                  }}
                >
                  <span
                    className={`font-mono text-sm font-bold ${SOAP_COLORS[i] ?? "text-primary"} mt-px w-4 flex-shrink-0`}
                  >
                    {item.key}
                  </span>
                  <span className="text-[13px] leading-relaxed text-white/65">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 3: Analysis */}
          <div
            className="absolute inset-0 px-5 pt-4 transition-all duration-500"
            style={{
              opacity: phase === "analysis" ? 1 : 0,
              transform:
                phase === "analysis"
                  ? "translateX(0)"
                  : phase === "actions"
                    ? "translateX(-20px)"
                    : "translateX(20px)",
              pointerEvents: phase === "analysis" ? "auto" : "none",
            }}
          >
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-primary/60" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                {c.clinicalAnalysis}
              </span>
            </div>
            <div className="space-y-3">
              {analysisItems.map((item, i) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-3 transition-all duration-500"
                  style={{
                    opacity: i <= analysisIndex ? 1 : 0,
                    transform:
                      i <= analysisIndex ? "translateY(0)" : "translateY(10px)",
                  }}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] font-medium text-white/70">
                      {item.label}
                    </p>
                    <p className={`text-[11px] ${item.color}`}>{item.status}</p>
                  </div>
                  <Check className="h-4 w-4 text-primary/60" />
                </div>
              ))}
            </div>
          </div>

          {/* Phase 4: Actions */}
          <div
            className="absolute inset-0 px-5 pt-4 transition-all duration-500"
            style={{
              opacity: phase === "actions" ? 1 : 0,
              transform:
                phase === "actions" ? "translateX(0)" : "translateX(20px)",
              pointerEvents: phase === "actions" ? "auto" : "none",
            }}
          >
            <div className="mb-4 flex items-center gap-2">
              <FolderHeart className="h-3.5 w-3.5 text-primary/60" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                {c.actionsComplete}
              </span>
            </div>
            <div className="space-y-2.5">
              {actionItems.map((item, i) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-3 transition-all duration-500"
                  style={{
                    opacity: i <= actionIndex ? 1 : 0,
                    transform:
                      i <= actionIndex ? "translateY(0)" : "translateY(10px)",
                  }}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <p className="flex-1 text-[13px] font-medium text-white/70">
                    {item.label}
                  </p>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Phase label footer */}
        <div className="border-t border-white/[0.06] bg-[#0a0e1a] px-5 py-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/25">
              {phases.find((p) => p.key === phase)?.label}
            </span>
            <span className="font-mono text-[10px] text-white/20">
              {phases.findIndex((p) => p.key === phase) + 1}/{phases.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
