"use client";

import { useState } from "react";

const soapSections = [
  {
    title: "S",
    label: "Subjective",
    content:
      "Patient reports persistent lower back pain for 3 weeks, radiating to left leg. Pain rated 7/10, worse with prolonged sitting.",
    color: "border-l-blue-500 bg-blue-50/50",
  },
  {
    title: "O",
    label: "Objective",
    content:
      "Tenderness at L4-L5. Straight leg raise positive at 45°. Normal reflexes. No motor weakness.",
    color: "border-l-green-500 bg-green-50/50",
  },
  {
    title: "A",
    label: "Assessment",
    content: "Lumbar radiculopathy, likely L4-L5 disc herniation.",
    color: "border-l-amber-500 bg-amber-50/50",
  },
  {
    title: "P",
    label: "Plan",
    content:
      "MRI lumbar spine. PT referral. Ibuprofen 600mg TID. Follow-up 2 weeks.",
    color: "border-l-purple-500 bg-purple-50/50",
  },
];

export function DocumentEditorUI() {
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-border/50 w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <span className="text-foreground text-sm font-medium">
            Clinical Note
          </span>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            isApproved
              ? "bg-accent/10 text-accent"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {isApproved ? "Approved" : "Ready for Review"}
        </span>
      </div>

      {/* Document Info */}
      <div className="bg-secondary/50 rounded-xl p-3 mb-4 border border-border/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">
            SOAP Note • Sarah Johnson
          </span>
          <span className="text-muted-foreground">Feb 4, 2026</span>
        </div>
      </div>

      {/* SOAP Sections */}
      <div className="space-y-2 mb-6">
        {soapSections.map((section, index) => (
          <div
            key={index}
            onClick={() =>
              setActiveSection(activeSection === index ? null : index)
            }
            className={`rounded-xl p-3 cursor-pointer transition-all duration-200 border-l-4 border ${
              section.color
            } ${activeSection === index ? "ring-2 ring-primary/30 shadow-md" : "hover:shadow-sm border-border/50"}`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-md bg-white shadow-sm flex items-center justify-center text-foreground font-bold text-xs">
                {section.title}
              </span>
              <span className="text-muted-foreground text-xs font-medium">
                {section.label}
              </span>
              {activeSection === index && (
                <svg
                  className="w-3.5 h-3.5 text-primary ml-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              )}
            </div>
            <p className="text-foreground text-xs leading-relaxed pl-8">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      {/* ICD/CPT Codes */}
      <div className="bg-primary/5 rounded-xl p-3 mb-6 border border-primary/10">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-3.5 h-3.5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span className="text-muted-foreground text-xs font-medium">
            Suggested Codes
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
            ICD-10: M54.5
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
            ICD-10: M51.16
          </span>
          <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-md font-medium">
            CPT: 99214
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button className="flex-1 h-10 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-colors flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit
        </button>
        <button
          onClick={() => setIsApproved(true)}
          className={`flex-1 h-10 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            isApproved
              ? "bg-accent text-white shadow-lg shadow-accent/30"
              : "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-lg shadow-primary/30"
          }`}
        >
          <svg
            className="w-4 h-4"
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
          {isApproved ? "Approved!" : "Approve"}
        </button>
      </div>
    </div>
  );
}
