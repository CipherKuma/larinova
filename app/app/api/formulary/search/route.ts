import { NextResponse } from "next/server";
import { searchFormulary } from "@/lib/formulary";
import type { Locale } from "@/src/i18n/routing";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q") ?? "";
  const localeParam = url.searchParams.get("locale") ?? "in";
  const locale = (
    ["in", "id"].includes(localeParam) ? localeParam : "in"
  ) as Locale;

  try {
    const results = await searchFormulary(locale, query);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("[formulary/search] failed:", err);
    return NextResponse.json(
      { error: "Formulary search failed" },
      { status: 500 },
    );
  }
}
