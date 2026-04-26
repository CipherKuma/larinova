"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-right"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast border bg-card text-card-foreground border-border shadow-lg rounded-xl",
          title: "text-sm font-semibold",
          description: "text-xs text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
          closeButton: "bg-card text-muted-foreground border-border",
          // Subtle accents — left-border only, never full background
          error:
            "border-l-2 border-l-destructive [&_[data-icon]]:text-destructive",
          success:
            "border-l-2 border-l-emerald-500 [&_[data-icon]]:text-emerald-500",
          warning:
            "border-l-2 border-l-amber-500 [&_[data-icon]]:text-amber-500",
          info: "border-l-2 border-l-sky-500 [&_[data-icon]]:text-sky-500",
        },
      }}
    />
  );
}
