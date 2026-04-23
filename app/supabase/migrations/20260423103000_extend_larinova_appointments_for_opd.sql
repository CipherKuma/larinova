-- ============================================================
-- Extend larinova_appointments for OPD flow (2026-04-23)
-- ============================================================
-- Links appointments to patients, intake templates/submissions,
-- and stores the AI-generated Prep Brief read by doctors before
-- the consult. Adds locale column for multi-market support.

ALTER TABLE larinova_appointments
  ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES larinova_patients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS intake_template_id UUID,
  ADD COLUMN IF NOT EXISTS intake_submission_id UUID,
  ADD COLUMN IF NOT EXISTS prep_brief JSONB,
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'in';

CREATE INDEX IF NOT EXISTS idx_larinova_appointments_patient_id
  ON larinova_appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_larinova_appointments_intake_submission_id
  ON larinova_appointments(intake_submission_id);
