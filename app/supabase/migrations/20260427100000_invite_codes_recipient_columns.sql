-- Structured recipient metadata on larinova_invite_codes so the sign-up
-- form can pre-fill First / Last / Email when an invited doctor lands
-- with a valid invite cookie. Avoids retyping data the admin already
-- recorded at /admin/codes/invite time.
--
-- The free-form `note` column stays as-is for any extra admin context
-- (it's still the source of truth for codes generated via the batch
-- "Generate codes" path which doesn't have recipient details).

ALTER TABLE larinova_invite_codes
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name  TEXT,
  ADD COLUMN IF NOT EXISTS email      TEXT;

-- Backfill from existing `note` values that follow the
-- "Dr. <First> <Last> <email@…>" pattern produced by the invite endpoint.
WITH parsed AS (
  SELECT
    code,
    regexp_match(note, '^Dr\.\s+(.+)\s+<(.+)>$') AS m
  FROM larinova_invite_codes
  WHERE note IS NOT NULL
    AND note ~ '^Dr\.\s+.+\s+<.+>$'
)
UPDATE larinova_invite_codes ic
SET
  email      = lower(trim(parsed.m[2])),
  first_name = split_part(trim(parsed.m[1]), ' ', 1),
  last_name  = CASE
    WHEN position(' ' IN trim(parsed.m[1])) = 0 THEN NULL
    ELSE NULLIF(
      trim(substring(trim(parsed.m[1]) FROM position(' ' IN trim(parsed.m[1])) + 1)),
      ''
    )
  END
FROM parsed
WHERE ic.code = parsed.code
  AND parsed.m IS NOT NULL;

-- Index for the per-cookie details fetch (sign-up pre-fill path).
CREATE INDEX IF NOT EXISTS idx_larinova_invite_codes_email
  ON larinova_invite_codes (email) WHERE email IS NOT NULL;
