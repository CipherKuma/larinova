"use client";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { tracker } from "@/lib/analytics/track";

function AnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    tracker.init();
  }, []);

  useEffect(() => {
    const fullPath =
      pathname +
      (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    tracker.trackPageview(fullPath);
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider() {
  // useSearchParams() requires a Suspense boundary in Next 15+ static generation.
  return (
    <Suspense fallback={null}>
      <AnalyticsInner />
    </Suspense>
  );
}
