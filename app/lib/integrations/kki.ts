/**
 * KKI (Konsil Kedokteran Indonesia) — Indonesia medical council registration.
 *
 * There is NO public KKI/STR verification API as of 2026-06. We therefore
 * CANNOT confirm a doctor's identity against an authoritative source. What we
 * can do is:
 *   1. Validate the *format* of the supplied STR (Surat Tanda Registrasi)
 *      number so obvious garbage is rejected at entry.
 *   2. Accept a well-formed number as `pending` — meaning the Larinova team
 *      will verify it manually before the doctor is treated as credential-
 *      verified. We never return `verified` from this function; that status
 *      is only ever set by a human reviewer once a KKI data source exists.
 *
 * STR number formats (per kki.go.id, 2025 migration):
 *   - Current: 2 letters + 14 digits (16 chars total), e.g. "AB12345678901234"
 *   - Legacy:  16 digits, all numeric
 *   - Older councils have historically issued 10–13 digit numeric variants.
 * Doctors frequently transcribe the number with separators (spaces, "/", "-",
 * ".") so we normalize those away before validating.
 */

export type KkiVerificationStatus = "pending" | "verified" | "failed";

export interface KkiLookupResult {
  /** The normalized registration number we will store and review. */
  registrationNumber: string;
  /**
   * Always "pending" from this function — a well-formed STR has been accepted
   * for manual review. Never "verified": no automated KKI source exists yet.
   */
  verified: KkiVerificationStatus;
  /** Always false until a real KKI data source / API exists. Honest signal to the UI. */
  autoVerified: false;
  /** Machine-readable reason the number was accepted (manual review still required). */
  reviewStatus: "pending_manual_review";
  doctorName?: string;
  specialty?: string;
}

export class KkiFormatError extends Error {
  readonly code = "INVALID_KKI_FORMAT";
  constructor(message = "Invalid STR/KKI registration number format") {
    super(message);
    this.name = "KkiFormatError";
  }
}

/**
 * Strip whitespace and common separators ("/", "-", ".") and upper-case the
 * remainder. STR numbers are issued without spaces; separators are a
 * transcription artifact.
 */
export function normalizeKkiNumber(raw: string): string {
  return raw.trim().replace(/[\s/.\-]+/g, "").toUpperCase();
}

/**
 * Validate the format of an Indonesian STR/KKI registration number.
 *
 * Accepts (after normalization):
 *   - 10–18 digits, all numeric (legacy + current numeric variants, with a
 *     little tolerance on length for council-specific formats), OR
 *   - 1–2 leading letters followed by 12–16 digits (current alphanumeric
 *     format and near neighbours).
 *
 * Rejects: empty input, anything shorter than 10 significant characters, and
 * anything containing characters other than letters/digits after normalization
 * (so the input genuinely looks like a registration number, not free text).
 *
 * This is a format gate, NOT identity verification — a valid format only means
 * the number is plausibly an STR and can proceed to manual review.
 */
export function isValidKkiFormat(raw: string): boolean {
  if (!raw || typeof raw !== "string") return false;
  const normalized = normalizeKkiNumber(raw);

  // Only letters and digits may remain after stripping separators.
  if (!/^[A-Z0-9]+$/.test(normalized)) return false;

  // All-numeric legacy/current variants: 10–18 digits.
  if (/^\d{10,18}$/.test(normalized)) return true;

  // Current alphanumeric format: 1–2 letters then 12–16 digits.
  if (/^[A-Z]{1,2}\d{12,16}$/.test(normalized)) return true;

  return false;
}

/**
 * "Lookup" an STR/KKI number. Because no authoritative source exists, this
 * validates format only and returns a `pending` result for manual review.
 * Throws `KkiFormatError` when the format is invalid so callers (and the
 * lookup route) can distinguish a bad number from an accepted-pending one.
 */
export async function lookupKki(
  registrationNumber: string,
): Promise<KkiLookupResult> {
  if (
    !registrationNumber ||
    typeof registrationNumber !== "string" ||
    !registrationNumber.trim()
  ) {
    throw new KkiFormatError("STR/KKI registration number is required");
  }

  if (!isValidKkiFormat(registrationNumber)) {
    throw new KkiFormatError(
      "That does not look like a valid STR number. Enter the number exactly as it appears on your STR (e.g. 16 digits, or 2 letters followed by digits).",
    );
  }

  return {
    registrationNumber: normalizeKkiNumber(registrationNumber),
    verified: "pending",
    autoVerified: false,
    reviewStatus: "pending_manual_review",
  };
}
