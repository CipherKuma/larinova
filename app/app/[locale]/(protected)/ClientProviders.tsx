"use client";

import { useEffect } from "react";
import { SidebarProvider } from "@/components/layout/SidebarContext";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  // Tell the PWA launch splash that the protected shell has mounted so it
  // can fade out — keeps the splash up through the JS bundle parse + first
  // hydration instead of dropping to a black background mid-load.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event("larinova:app-ready"));
  }, []);

  return <SidebarProvider>{children}</SidebarProvider>;
}
