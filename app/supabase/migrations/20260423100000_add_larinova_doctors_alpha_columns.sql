-- Alpha doctor flags on larinova_doctors.
-- India OPD pilot: 5 whitelisted emails upgrade to Pro on login and are flagged
-- is_alpha=true; alpha_welcomed_at records the one-shot Resend welcome send.
ALTER TABLE larinova_doctors
  ADD COLUMN IF NOT EXISTS is_alpha BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS alpha_welcomed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_larinova_doctors_is_alpha
  ON larinova_doctors(is_alpha)
  WHERE is_alpha = true;
