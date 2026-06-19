import type { NextConfig } from "next";

// Patient portal handles PHI, so it ships a strict CSP. Notably there is NO
// 'unsafe-eval': production Next 16 does not need eval, and allowing it on a
// patient-PII surface is an unnecessary XSS escalation vector. 'unsafe-inline'
// is kept only for the Next.js bootstrap/runtime <script> and Tailwind inline
// styles, which Next does not yet emit with nonces.
//
// Supabase origins are scoped to this project (not a *.supabase.co wildcard)
// by reading NEXT_PUBLIC_SUPABASE_URL at build time. The matching wss:// origin
// is derived for Realtime. Fonts are self-hosted via next/font, so no
// fonts.gstatic.com / fonts.googleapis.com origins are required.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
const supabaseWsOrigin = supabaseUrl?.replace(/^https:/, "wss:");
const mainAppUrl = (
  process.env.NEXT_PUBLIC_MAIN_APP_URL ?? "https://app.larinova.com"
).replace(/\/+$/, "");

const connectSrc = ["'self'", supabaseUrl, supabaseWsOrigin, mainAppUrl]
  .filter(Boolean)
  .join(" ");
const imgSrc = ["'self'", "data:", "blob:", supabaseUrl]
  .filter(Boolean)
  .join(" ");

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      `img-src ${imgSrc}`,
      "media-src 'self'",
      `connect-src ${connectSrc}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["noir", "noir.local", "100.100.148.117"],
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
