-- ============================================================
-- larinova_messages (2026-04-23)
-- ============================================================
-- Unified log of every outbound + inbound message across all
-- channels (email, sms, whatsapp, in_app). Written to by
-- lib/notify and updated by provider delivery webhooks.

CREATE TABLE IF NOT EXISTS larinova_messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id          UUID REFERENCES larinova_patients(id) ON DELETE SET NULL,
  doctor_id           UUID REFERENCES larinova_doctors(id) ON DELETE SET NULL,
  channel             TEXT NOT NULL CHECK (channel IN ('email','sms','whatsapp','in_app')),
  direction           TEXT NOT NULL CHECK (direction IN ('out','in')),
  template_key        TEXT,
  subject             TEXT,
  body                TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id   UUID,
  provider            TEXT,
  provider_msg_id     TEXT,
  recipient_email     TEXT,
  recipient_phone     TEXT,
  status              TEXT CHECK (status IN ('queued','sent','delivered','read','failed','replied','simulated')),
  error               TEXT,
  locale              TEXT NOT NULL DEFAULT 'in',
  sent_at             TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  read_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_larinova_messages_patient_id_created_at
  ON larinova_messages (patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_larinova_messages_doctor_id_created_at
  ON larinova_messages (doctor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_larinova_messages_provider_msg_id
  ON larinova_messages (provider_msg_id) WHERE provider_msg_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_larinova_messages_related_entity
  ON larinova_messages (related_entity_type, related_entity_id);

ALTER TABLE larinova_messages ENABLE ROW LEVEL SECURITY;

-- Doctors read any message tied to one of their patients.
CREATE POLICY "doctors_read_patient_messages"
  ON larinova_messages
  FOR SELECT
  USING (
    doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
    OR
    patient_id IN (
      SELECT patient_id FROM larinova_appointments
      WHERE doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
    )
  );
