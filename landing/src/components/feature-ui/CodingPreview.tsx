"use client";

import { useState, useEffect } from "react";

const codes = [
  { type: "ICD-10", code: "I25.10", desc: "Coronary artery disease" },
  { type: "ICD-10", code: "R07.9", desc: "Chest pain" },
  { type: "CPT", code: "99214", desc: "Office visit" },
];

export function CodingPreview() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % codes.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full p-3 flex flex-col justify-center">
      <div className="space-y-2">
        {codes.map((code, index) => {
          const isDone = index < activeIndex;
          const isActive = index === activeIndex;
          const isPending = index > activeIndex;

          return (
            <div
              key={code.code}
              className={`flex items-center gap-2 transition-all duration-500 ${
                isPending ? "opacity-40" : "opacity-100"
              }`}
            >
              {/* Status indicator */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isDone
                    ? "bg-accent"
                    : isActive
                      ? "bg-primary"
                      : "bg-secondary border border-border"
                }`}
              >
                {isDone ? (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : isActive ? (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                ) : (
                  <div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full" />
                )}
              </div>

              {/* Code info */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className={`px-1.5 py-0.5 text-[9px] font-bold rounded flex-shrink-0 ${
                    code.type === "ICD-10"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {code.type}
                </span>
                <span className="text-xs font-mono font-semibold text-foreground">
                  {code.code}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {code.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
