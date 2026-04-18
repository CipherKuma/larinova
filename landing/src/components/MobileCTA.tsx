"use client";

import { useEffect, useState } from "react";
import { type Locale, content as localeContent } from "@/data/locale-content";

interface MobileCTAProps {
  locale: Locale;
}

export function MobileCTA({ locale }: MobileCTAProps) {
  const cta = localeContent[locale].mobileCta;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-background/95 px-4 py-3 backdrop-blur-lg transition-transform duration-300 sm:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <a
        href="https://app.larinova.com"
        className="block w-full rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-foreground"
      >
        {cta}
      </a>
    </div>
  );
}
