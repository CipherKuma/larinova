"use client";

import { useState, useEffect } from "react";

const sections = [
  {
    letter: "S",
    label: "Subjective",
    color: "bg-blue-500",
    text: "Patient reports chest pain for 2 days...",
  },
  {
    letter: "O",
    label: "Objective",
    color: "bg-emerald-500",
    text: "BP 120/80, HR 72, Temp 98.6°F...",
  },
  {
    letter: "A",
    label: "Assessment",
    color: "bg-amber-500",
    text: "Suspected angina pectoris...",
  },
  {
    letter: "P",
    label: "Plan",
    color: "bg-violet-500",
    text: "Order ECG, stress test, follow-up...",
  },
];

export function SOAPPreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const currentText = sections[activeIndex].text;

    if (isTyping && displayedText.length < currentText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(currentText.slice(0, displayedText.length + 1));
      }, 30);
      return () => clearTimeout(timer);
    } else if (displayedText.length >= currentText.length) {
      // Wait then move to next section
      const timer = setTimeout(() => {
        setIsTyping(false);
        setTimeout(() => {
          setActiveIndex((i) => (i + 1) % 4);
          setDisplayedText("");
          setIsTyping(true);
        }, 300);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [displayedText, activeIndex, isTyping]);

  return (
    <div className="h-full w-full flex">
      {/* Sidebar */}
      <div className="w-10 bg-secondary/50 border-r border-border/30 flex flex-col py-2">
        {sections.map((section, index) => (
          <div
            key={section.letter}
            className={`flex-1 flex items-center justify-center transition-all duration-300 ${
              index === activeIndex
                ? "bg-white shadow-sm"
                : index < activeIndex
                  ? "opacity-100"
                  : "opacity-40"
            }`}
          >
            <div
              className={`w-6 h-6 rounded ${section.color} flex items-center justify-center transition-all duration-300 ${
                index === activeIndex ? "scale-110" : ""
              }`}
            >
              {index < activeIndex ? (
                <svg
                  className="w-3.5 h-3.5 text-white"
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
              ) : (
                <span className="text-white text-xs font-bold">
                  {section.letter}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Content area - ChatGPT style */}
      <div className="flex-1 p-3 flex flex-col">
        <div className="flex items-center gap-1.5 mb-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${sections[activeIndex].color}`}
          />
          <span className="text-[10px] font-medium text-foreground">
            {sections[activeIndex].label}
          </span>
        </div>

        <div className="flex-1 text-[10px] text-muted-foreground leading-relaxed">
          {displayedText}
          {isTyping && (
            <span className="inline-block w-0.5 h-3 bg-primary ml-0.5 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
