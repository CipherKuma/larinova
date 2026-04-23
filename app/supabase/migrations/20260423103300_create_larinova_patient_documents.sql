-- ============================================================
-- larinova_patient_documents + storage bucket (2026-04-23)
-- ============================================================
-- Lab reports, images, Rx PDFs, etc. Uploader may be patient,
-- doctor, or an AI agent. AI summary stored as JSONB.

CREATE TABLE IF NOT EXISTS larinova_patient_documents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID REFERENCES larinova_patients(id) ON DELETE CASCADE,
  appointment_id    UUID REFERENCES larinova_appointments(id) ON DELETE SET NULL,
  consultation_id   UUID REFERENCES larinova_consultations(id) ON DELETE SET NULL,
  uploader          TEXT NOT NULL CHECK (uploader IN ('patient','doctor','agent')),
  kind              TEXT NOT NULL CHECK (kind IN ('lab_report','image','prescription','other')),
  storage_path      TEXT NOT NULL,
  original_filename TEXT,
  mime_type         TEXT,
  ai_summary        JSONB,
  locale            TEXT NOT NULL DEFAULT 'in',
  uploaded_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_larinova_patient_documents_patient_id
  ON larinova_patient_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_larinova_patient_documents_appointment_id
  ON larinova_patient_documents(appointment_id);

ALTER TABLE larinova_patient_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctors_read_own_patient_documents"
  ON larinova_patient_documents
  FOR SELECT
  USING (
    patient_id IN (
      SELECT patient_id FROM larinova_appointments
      WHERE doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
    )
    OR
    patient_id IN (
      SELECT patient_id FROM larinova_consultations
      WHERE doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "public_insert_patient_documents"
  ON larinova_patient_documents
  FOR INSERT
  WITH CHECK (true);

-- Private storage bucket for patient-uploaded files.
-- Idempotent insert; RLS on storage.objects handled separately.
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-documents', 'patient-documents', false)
ON CONFLICT (id) DO NOTHING;
