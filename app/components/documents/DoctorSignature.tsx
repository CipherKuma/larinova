"use client";

/**
 * Renders a doctor's signature for clinical documents.
 *
 * Two modes, in priority order:
 *  1. A saved drawn / uploaded signature image (PNG data URL or hosted URL).
 *  2. A typed cursive rendering of the doctor's name — always available, so a
 *     certificate never prints an empty signature line.
 *
 * This is the SINGLE source of the doctor signature in the print preview and
 * the html2pdf export. The certificate content body no longer embeds its own
 * "Signature and seal" line (see lib/documents/sick-leave-certificate.ts).
 *
 * Cursive is rendered with an OS-bundled handwriting font stack rather than a
 * web font, so it works inside this Client Component without a root-layout
 * font import and rasterizes correctly through html2canvas during PDF export.
 */

// Cross-platform handwriting stack: macOS / iOS → Snell Roundhand, Windows →
// Segoe Script / Brush Script MT, then the generic cursive keyword.
const CURSIVE_STACK =
  '"Snell Roundhand", "Segoe Script", "Bradley Hand", "Brush Script MT", "Lucida Handwriting", cursive';

export interface DoctorSignatureProps {
  doctorName?: string | null;
  /** Saved signature image: PNG data URL or hosted URL. */
  signatureUrl?: string | null;
  /** px height of the signature mark area. */
  height?: number;
}

export function DoctorSignature({
  doctorName,
  signatureUrl,
  height = 56,
}: DoctorSignatureProps) {
  const displayName = `Dr. ${doctorName?.trim() || "Doctor"}`;

  return (
    <div className="inline-flex flex-col items-end">
      <div
        className="flex items-end justify-end"
        style={{ minHeight: height }}
      >
        {signatureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signatureUrl}
            alt={`${displayName} signature`}
            crossOrigin="anonymous"
            style={{ height, width: "auto", maxWidth: 260, objectFit: "contain" }}
          />
        ) : (
          <span
            aria-label={`${displayName} signature`}
            style={{
              fontFamily: CURSIVE_STACK,
              fontSize: Math.round(height * 0.62),
              lineHeight: 1,
              color: "#111",
              paddingBottom: 2,
              whiteSpace: "nowrap",
            }}
          >
            {displayName}
          </span>
        )}
      </div>
      <div className="w-44 border-b border-black mb-1" />
      <p className="text-sm font-medium text-black">{displayName}</p>
    </div>
  );
}
