-- ============================================================
-- larinova_patient_narrative (2026-04-23)
-- ============================================================
-- AI-generated 3-5 sentence doctor-facing summary, regenerated
-- on every new consultation. One row per patient.

CREATE TABLE IF NOT EXISTS larinova_patient_narrative (
  patient_id             UUID PRIMARY KEY REFERENCES larinova_patients(id) ON DELETE CASCADE,
  summary_md             TEXT NOT NULL,
  source_consultation_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  model                  TEXT,
  locale                 TEXT NOT NULL DEFAULT 'in',
  generated_at           TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE larinova_patient_narrative ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctors_read_own_patient_narrative"
  ON larinova_patient_narrative
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
