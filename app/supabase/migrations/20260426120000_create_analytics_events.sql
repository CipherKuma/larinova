-- Custom event-tracking pipeline (replaces 3rd-party analytics).
-- Spec: docs/superpowers/specs/2026-04-26-admin-analytics-issues-design.md §5.3

CREATE TABLE larinova_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id   TEXT NOT NULL,
  anonymous_id TEXT NOT NULL,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type   TEXT NOT NULL CHECK (event_type IN ('pageview','click','milestone','admin_action')),
  path         TEXT,
  raw_path     TEXT,
  element      TEXT,
  properties   JSONB DEFAULT '{}'::jsonb,
  user_agent   TEXT,
  ip_hash      TEXT,
  locale       TEXT
);

CREATE INDEX idx_events_ts ON larinova_events (ts DESC);
CREATE INDEX idx_events_session ON larinova_events (session_id, ts);
CREATE INDEX idx_events_user ON larinova_events (user_id, ts DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_events_type_path ON larinova_events (event_type, path);

ALTER TABLE larinova_events ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated) can INSERT (rate-limited at the
-- ingest endpoint, not RLS). Reads are admin-only via service role.
CREATE POLICY events_insert_anon ON larinova_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY events_insert_authed ON larinova_events FOR INSERT TO authenticated WITH CHECK (true);
