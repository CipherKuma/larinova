import { NextRequest, NextResponse } from "next/server";

const LOCALE_COOKIE = "larinova_locale";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// Paths that should never be locale-redirected
const BYPASS_PREFIXES = [
  "/in",
  "/id",
  "/blog",
  "/book",
  "/api",
  "/_next",
  "/favicon",
  "/images",
  "/videos",
  "/sarvam",
  "/larinova",
];

function shouldBypass(pathname: string): boolean {
  return BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function detectLocale(request: NextRequest): "in" | "id" {
  // 1. Vercel geo header (production)
  const vercelCountry = request.headers.get("x-vercel-ip-country");
  if (vercelCountry === "ID") return "id";
  if (vercelCountry && vercelCountry !== "ID") return "in";

  // 2. Cloudflare geo header (CF proxy)
  const cfCountry = request.headers.get("cf-ipcountry");
  if (cfCountry === "ID") return "id";
  if (cfCountry && cfCountry !== "ID") return "in";

  // 3. Accept-Language fallback (works in local dev + when no geo header)
  const acceptLang = request.headers.get("accept-language") ?? "";
  // Indonesian browser locales: id, id-ID
  if (/\bid(-[A-Z]{2})?\b/i.test(acceptLang)) return "id";

  // Default to India
  return "in";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Set x-pathname header so root layout can read it for html lang attribute
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // Redirect legacy /en/* URLs to /in/*
  if (pathname.startsWith("/en")) {
    const newPath = pathname.replace(/^\/en/, "/in");
    const url = request.nextUrl.clone();
    url.pathname = newPath;
    return NextResponse.redirect(url, { status: 301 });
  }

  // Pass through all non-root paths with the x-pathname header
  if (pathname !== "/") {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // ── Root path "/" ──────────────────────────────────────────
  // Check if the user already has a locale preference cookie
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale === "in" || cookieLocale === "id") {
    const url = request.nextUrl.clone();
    url.pathname = `/${cookieLocale}`;
    const response = NextResponse.redirect(url, { status: 307 });
    // Re-pass x-pathname on redirect too
    response.headers.set("x-pathname", `/${cookieLocale}`);
    return response;
  }

  // Detect locale from geo/browser signals
  const locale = detectLocale(request);

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}`;

  const response = NextResponse.redirect(url, { status: 307 });
  response.cookies.set(LOCALE_COOKIE, locale, {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico)).*)",
  ],
};
