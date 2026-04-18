"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQS } from "@/data/faqs";
import { FAQS_ID } from "@/data/faqs-id";
import { type Locale, content as localeContent } from "@/data/locale-content";

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/[0.06]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-primary"
      >
        <span className="pr-4 text-[15px] font-medium text-foreground">
          {q}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? 300 : 0, opacity: open ? 1 : 0 }}
      >
        <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
          {a}
        </p>
      </div>
    </div>
  );
}

interface FAQProps {
  locale: Locale;
}

export function FAQ({ locale }: FAQProps) {
  const c = localeContent[locale].faq;
  const faqs = locale === "id" ? FAQS_ID : FAQS;

  return (
    <section id="faq" className="relative py-32">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block font-mono text-xs uppercase tracking-widest text-primary">
            {c.sectionLabel}
          </span>
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            {c.headline}
          </h2>
        </div>
        <div>
          {faqs.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
