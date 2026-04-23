-- ============================================================
-- larinova_intake_templates (2026-04-23)
-- ============================================================
-- Doctor-defined intake forms. `fields` is a JSONB array of
-- { id, type, label, required, options? }.

CREATE TABLE IF NOT EXISTS larinova_intake_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id   UUID NOT NULL REFERENCES larinova_doctors(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  fields      JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_default  BOOLEAN DEFAULT false,
  locale      TEXT NOT NULL DEFAULT 'in',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_larinova_intake_templates_doctor_id
  ON larinova_intake_templates(doctor_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_larinova_intake_templates_doctor_default
  ON larinova_intake_templates(doctor_id) WHERE is_default;

ALTER TABLE larinova_intake_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctors_manage_own_intake_templates"
  ON larinova_intake_templates
  FOR ALL
  USING (doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid()))
  WITH CHECK (doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid()));

CREATE POLICY "public_read_default_intake_templates"
  ON larinova_intake_templates
  FOR SELECT
  USING (is_default = true);
