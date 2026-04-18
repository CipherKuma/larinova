"use client";

import { useState, useEffect } from "react";

const extractedEntities = [
  {
    type: "Symptom",
    value: "Lower back pain",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    type: "Duration",
    value: "3 weeks",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    type: "Location",
    value: "L4-L5 region",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    type: "Severity",
    value: "7/10",
    color: "bg-red-100 text-red-700 border-red-200",
  },
];

const processingSteps = [
  { label: "Speech Recognition", progress: 100 },
  { label: "Medical NLP Analysis", progress: 100 },
  { label: "Entity Extraction", progress: 85 },
  { label: "Note Generation", progress: 45 },
];

export function AIProcessingUI() {
  const [displayedText, setDisplayedText] = useState("");
  const [currentEntityIndex, setCurrentEntityIndex] = useState(0);

  const fullText =
    "Patient presents with persistent lower back pain radiating to left leg, onset 3 weeks ago. Pain rated 7/10, worse with prolonged sitting. No numbness or weakness reported.";

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 30);
    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    const entityInterval = setInterval(() => {
      setCurrentEntityIndex((prev) => (prev + 1) % extractedEntities.length);
    }, 2000);
    return () => clearInterval(entityInterval);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-border/50 w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent animate-ping" />
          </div>
          <span className="text-foreground text-sm font-medium">
            AI Processing
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>

      {/* Processing Steps */}
      <div className="space-y-3 mb-6">
        {processingSteps.map((step, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground text-xs">
                {step.label}
              </span>
              <span className="text-muted-foreground text-xs">
                {step.progress}%
              </span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  step.progress === 100
                    ? "bg-accent"
                    : "bg-gradient-to-r from-primary to-accent"
                }`}
                style={{
                  width: `${step.progress}%`,
                  animation:
                    step.progress < 100
                      ? "pulse 1.5s ease-in-out infinite"
                      : "none",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Transcript with Typing Effect */}
      <div className="bg-secondary/30 rounded-xl p-4 mb-6 border border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="text-muted-foreground text-xs uppercase tracking-wider">
            Transcript Analysis
          </span>
        </div>
        <p className="text-foreground text-sm leading-relaxed">
          {displayedText}
          <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
        </p>
      </div>

      {/* Extracted Entities */}
      <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
        <div className="flex items-center gap-2 mb-3">
          <svg
            className="w-4 h-4 text-accent"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <span className="text-muted-foreground text-xs uppercase tracking-wider">
            Extracted Entities
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {extractedEntities.map((entity, index) => (
            <div
              key={index}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-500 ${
                entity.color
              } ${index === currentEntityIndex ? "ring-2 ring-primary/30 scale-105" : ""}`}
            >
              <span className="opacity-70">{entity.type}:</span>{" "}
              <span className="font-semibold">{entity.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
