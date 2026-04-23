-- ============================================================
-- larinova_intake_submissions (2026-04-23)
-- ============================================================
-- Patient's completed intake form for one appointment. The
-- intake AI writes back into ai_followup_rounds and may drive
-- multi-round follow-ups before marking ready.

CREATE TABLE IF NOT EXISTS larinova_intake_submissions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id      UUID REFERENCES larinova_appointments(id) ON DELETE CASCADE,
  patient_id          UUID REFERENCES larinova_patients(id) ON DELETE SET NULL,
  template_id         UUID REFERENCES larinova_intake_templates(id) ON DELETE SET NULL,
  form_data           JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_followup_rounds  INTEGER NOT NULL DEFAULT 0,
  ai_ready            BOOLEAN NOT NULL DEFAULT false,
  locale              TEXT NOT NULL DEFAULT 'in',
  submitted_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_larinova_intake_submissions_appointment_id
  ON larinova_intake_submissions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_larinova_intake_submissions_patient_id
  ON larinova_intake_submissions(patient_id);

ALTER TABLE larinova_intake_submissions ENABLE ROW LEVEL SECURITY;

-- Doctor reads intake submissions tied to their appointments
CREATE POLICY "doctors_read_own_intake_submissions"
  ON larinova_intake_submissions
  FOR SELECT
  USING (
    appointment_id IN (
      SELECT id FROM larinova_appointments
      WHERE doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "doctors_update_own_intake_submissions"
  ON larinova_intake_submissions
  FOR UPDATE
  USING (
    appointment_id IN (
      SELECT id FROM larinova_appointments
      WHERE doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
    )
  );

-- Public insert for booking flow; service role (agents) writes freely
CREATE POLICY "public_insert_intake_submissions"
  ON larinova_intake_submissions
  FOR INSERT
  WITH CHECK (true);
