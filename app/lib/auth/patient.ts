import { createClient } from "@supabase/supabase-js";

/**
 * Verify a patient-portal Supabase JWT from the Authorization header.
 *
 * Patient-portal requests carry a Bearer token minted by
 * supabase.auth.signInWithOtp on the portal. We verify it by asking Supabase
 * to resolve the user — this also ensures the token is still active.
 * Returns the JWT email claim (the canonical identifier the portal uses for
 * scoping access) or null if invalid.
 */

export async function getPatientFromAuthHeader(
  req: Request,
): Promise<{ email: string; userId: string } | null> {
  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  // Use a transient client with no persistence — we only need getUser(token).
  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) return null;
  return { email: data.user.email, userId: data.user.id };
}
