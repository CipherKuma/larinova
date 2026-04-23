-- ============================================================
-- larinova_agent_jobs (2026-04-23)
-- ============================================================
-- Observability for every AI agent run. One row per Inngest
-- step (or per run, depending on granularity). Logs model,
-- tokens, cost, attempt count, and a JSON result.

CREATE TABLE IF NOT EXISTS larinova_agent_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent           TEXT NOT NULL CHECK (agent IN ('intake','dispatcher','wellness','narrative')),
  step            TEXT,
  event           TEXT NOT NULL,
  correlation_id  TEXT,
  payload         JSONB,
  result          JSONB,
  status          TEXT CHECK (status IN ('pending','running','succeeded','failed','dead_lettered')),
  attempts        INTEGER DEFAULT 0,
  last_error      TEXT,
  model           TEXT,
  tokens_input    INTEGER,
  tokens_output   INTEGER,
  cost_cents      INTEGER,
  locale          TEXT NOT NULL DEFAULT 'in',
  started_at      TIMESTAMPTZ,
  finished_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_larinova_agent_jobs_agent_status_created
  ON larinova_agent_jobs (agent, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_larinova_agent_jobs_correlation
  ON larinova_agent_jobs (correlation_id) WHERE correlation_id IS NOT NULL;

ALTER TABLE larinova_agent_jobs ENABLE ROW LEVEL SECURITY;

-- Admin-only read for v1; no doctor-facing RLS policy. Service
-- role bypasses RLS. No anon/authenticated policies granted.
