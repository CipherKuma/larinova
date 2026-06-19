-- Doctor signature for clinical documents (certificates, prescriptions, letters).
--
-- Stored as a transparent PNG data URL (or hosted URL). Captured once from the
-- documents UI (typed-cursive or drawn-on-canvas) and reused across every
-- document the doctor issues. Rendered by components/documents/DoctorSignature.tsx
-- into the print preview and the html2pdf export.
--
-- Distinct from the existing did_signature / tx_signature columns, which are
-- decentralized-identity / transaction signatures, not a handwritten mark.
ALTER TABLE larinova_doctors
  ADD COLUMN IF NOT EXISTS signature_image_url TEXT;
