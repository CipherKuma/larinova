"use client";

import { useState, useEffect } from "react";

const documents = [
  { type: "Referral", icon: "↗️", to: "Cardiology" },
  { type: "Discharge", icon: "📄", to: "Patient" },
  { type: "Summary", icon: "📋", to: "Primary Care" },
];

export function DocumentPreview() {
  const [currentDoc, setCurrentDoc] = useState(0);
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setGenerating(true);
      setTimeout(() => {
        setGenerating(false);
        setTimeout(() => {
          setCurrentDoc((prev) => (prev + 1) % documents.length);
        }, 800);
      }, 1200);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const doc = documents[currentDoc];

  return (
    <div className="h-full w-full p-3 flex flex-col items-center justify-center">
      {/* Document card */}
      <div
        className={`w-full max-w-[140px] bg-white rounded-lg border shadow-sm transition-all duration-500 ${
          generating
            ? "border-primary/30 shadow-primary/10"
            : "border-accent/30 shadow-accent/10"
        }`}
      >
        {/* Doc header */}
        <div className="p-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-sm">{doc.icon}</span>
            <span className="text-xs font-medium text-foreground">
              {doc.type} Letter
            </span>
          </div>
        </div>

        {/* Doc content placeholder */}
        <div className="p-2 space-y-1.5">
          {[100, 80, 90, 60].map((width, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                generating ? "bg-primary/20 animate-pulse" : "bg-secondary"
              }`}
              style={{ width: `${width}%` }}
            />
          ))}
        </div>

        {/* Doc footer */}
        <div className="p-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              To: {doc.to}
            </span>
            {!generating && (
              <svg
                className="w-3 h-3 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Status */}
      <p className="text-[10px] text-muted-foreground mt-3">
        {generating ? "Generating..." : "Ready to send"}
      </p>
    </div>
  );
}
