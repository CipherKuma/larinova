/**
 * Shared CORS helper for cross-origin calls from the patient portal.
 *
 * Allowed origins are configurable via NEXT_PUBLIC_PATIENT_PORTAL_URL (prod)
 * plus localhost for development. Every cross-origin API route should:
 *   - Export an OPTIONS handler that returns corsHeaders() with 204.
 *   - Merge corsHeaders() into every JSON response from the route.
 */

const DEV_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

function allowedOrigins(): string[] {
  const portal =
    process.env.NEXT_PUBLIC_PATIENT_PORTAL_URL ??
    "https://patient.larinova.com";
  return [portal, ...DEV_ORIGINS];
}

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowed = allowedOrigins().includes(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function preflight(req: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

export function jsonWithCors<T>(
  req: Request,
  body: T,
  init: ResponseInit = {},
): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(req),
      ...(init.headers as Record<string, string> | undefined),
    },
  });
}
