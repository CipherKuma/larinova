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

  // Root path "/" — pass through to src/app/page.tsx which renders a real
  // 200 OK homepage (brand, locale CTAs, sign-in link). Previously did a
  // 307 redirect to /in or /id here, but that broke Razorpay's payment-
  // gateway verifier (and similar crawlers/bots) that expect a 200 at the
  // root URL without following redirects.
  //
  // Real humans still get locale-aware experience: the root page shows
  // explicit India / Indonesia buttons. Locale cookie + geo detection are
  // still used for the /blog, /book, and other non-locale paths below.
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

// Keep the detectLocale helper exported shape intact for future use.
export { detectLocale as _detectLocaleForFutureUse };

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico)).*)",
  ],
};
