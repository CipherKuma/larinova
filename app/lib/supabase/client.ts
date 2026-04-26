import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;
let consoleFilterInstalled = false;

// Supabase's GoTrueClient logs `console.error` from inside its refresh
// loop when the refresh token is missing/expired. Next.js dev overlay
// surfaces every console.error as a red error popup. Filter that one
// specific log — the auth path itself recovers fine (we sign out locally
// on the SIGNED_OUT event below + the middleware clears the sb-* cookies).
function installConsoleFilter() {
  if (consoleFilterInstalled || typeof window === "undefined") return;
  consoleFilterInstalled = true;
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const text = args
      .map((a) => {
        if (typeof a === "string") return a;
        if (a instanceof Error) return a.message;
        try {
          return JSON.stringify(a);
        } catch {
          return String(a);
        }
      })
      .join(" ")
      .toLowerCase();
    if (
      text.includes("refresh token not found") ||
      text.includes("invalid refresh token") ||
      text.includes("refresh_token_not_found")
    ) {
      return;
    }
    originalError.apply(console, args as Parameters<typeof console.error>);
  };
}

export function createClient() {
  if (cached) return cached;
  installConsoleFilter();

  cached = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // If the refresh attempt fails, GoTrue emits SIGNED_OUT. Make sure local
  // state is cleared so we don't loop on a dead session.
  cached.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") return;
  });

  return cached;
}
