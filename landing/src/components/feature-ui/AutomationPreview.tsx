"use client";

import { useState, useEffect } from "react";

const tasks = [
  {
    label: "Generate Summary",
    detail: "Creating visit summary...",
    icon: (
      <svg
        className="w-3.5 h-3.5"
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
    ),
  },
  {
    label: "Update Prescription",
    detail: "Syncing medications...",
    icon: (
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>
    ),
  },
  {
    label: "Schedule Follow-up",
    detail: "Booking appointment...",
    icon: (
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    label: "Sync to EHR",
    detail: "Uploading records...",
    icon: (
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
    ),
  },
];

export function AutomationPreview() {
  const [activeTask, setActiveTask] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTask((t) => (t + 1) % tasks.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full p-3 flex flex-col justify-center">
      <div className="space-y-1.5">
        {tasks.map((task, index) => {
          const isDone = index < activeTask;
          const isActive = index === activeTask;
          const isPending = index > activeTask;

          return (
            <div
              key={task.label}
              className={`flex items-center gap-2 transition-all duration-300 ${
                isPending ? "opacity-40" : "opacity-100"
              }`}
            >
              {/* Status indicator */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isDone
                    ? "bg-accent text-white"
                    : isActive
                      ? "bg-primary text-white"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {isDone ? (
                  <svg
                    className="w-3 h-3"
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
                  task.icon
                )}
              </div>

              {/* Task info */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-foreground truncate">
                  {task.label}
                </p>
                {isActive && (
                  <p className="text-[9px] text-primary animate-pulse truncate">
                    {task.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
