"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "motion/react";

const REGIONS = [
  { code: "in", label: "India", flag: "🇮🇳" },
  { code: "id", label: "Indonesia", flag: "🇮🇩" },
] as const;

export function RegionSwitcher({ open = true }: { open?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const current = REGIONS.find((r) => r.code === locale) ?? REGIONS[0];

  async function switchTo(code: "in" | "id") {
    if (code === locale) return;

    const newPath = pathname.replace(/^\/(in|id)(?=\/|$)/, `/${code}`);

    document.cookie = `larinova_locale=${code}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;

    fetch("/api/user/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: code }),
    }).catch(() => {});

    router.push(newPath);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-3 w-full
            px-3 py-3
            rounded-xl
            text-sm font-medium text-muted-foreground
            hover:text-foreground
            transition-colors duration-200
            ${!open ? "justify-center" : ""}`}
          title={!open ? current.label : ""}
        >
          <span className="text-base leading-none flex-shrink-0">
            {current.flag}
          </span>
          <motion.span
            animate={{
              display: open ? "inline-block" : "none",
              opacity: open ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="whitespace-pre"
          >
            {current.label}
          </motion.span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top">
        {REGIONS.map((r) => (
          <DropdownMenuItem
            key={r.code}
            onClick={() => switchTo(r.code)}
            className="gap-2"
          >
            <span>{r.flag}</span>
            <span>{r.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
