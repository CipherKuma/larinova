-- ============================================================
-- larinova_follow_up_threads (2026-04-23)
-- ============================================================
-- One thread per scheduled wellness check-in (day-1/3/7).
-- Tracks the agent↔patient conversation, outcome classification,
-- and doctor flagging state.

CREATE TABLE IF NOT EXISTS larinova_follow_up_threads (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id           UUID REFERENCES larinova_patients(id) ON DELETE CASCADE,
  doctor_id            UUID REFERENCES larinova_doctors(id) ON DELETE SET NULL,
  consultation_id      UUID REFERENCES larinova_consultations(id) ON DELETE CASCADE,
  tier                 TEXT NOT NULL CHECK (tier IN ('day-1','day-3','day-7')),
  scheduled_for        TIMESTAMPTZ NOT NULL,
  status               TEXT NOT NULL DEFAULT 'scheduled'
                         CHECK (status IN ('scheduled','active','closed','opted_out')),
  transcript           JSONB NOT NULL DEFAULT '[]'::jsonb,
  outcome              TEXT CHECK (outcome IN ('improving','unchanged','flagged','closed')),
  flagged              BOOLEAN NOT NULL DEFAULT false,
  doctor_notified_at   TIMESTAMPTZ,
  patient_opted_out    BOOLEAN NOT NULL DEFAULT false,
  exchanges_count      INTEGER NOT NULL DEFAULT 0,
  locale               TEXT NOT NULL DEFAULT 'in',
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_larinova_follow_up_threads_patient_id
  ON larinova_follow_up_threads (patient_id);
CREATE INDEX IF NOT EXISTS idx_larinova_follow_up_threads_doctor_flagged
  ON larinova_follow_up_threads (doctor_id, flagged) WHERE flagged = true;
CREATE INDEX IF NOT EXISTS idx_larinova_follow_up_threads_scheduled
  ON larinova_follow_up_threads (scheduled_for) WHERE status = 'scheduled';

ALTER TABLE larinova_follow_up_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctors_read_own_follow_up_threads"
  ON larinova_follow_up_threads
  FOR SELECT
  USING (doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid()));
