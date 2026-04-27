-- full_name on larinova_doctors is now a Postgres GENERATED column derived
-- from first_name + last_name. The trigger that previously kept them in
-- sync is removed (Postgres enforces the derivation). NOT NULL is gone
-- because both inputs can legitimately be NULL during the brief window
-- between OTP auth callback (creates the doctor row) and onboarding
-- StepName (captures first/last).
--
-- Effect on app code:
--   - All 30+ readers (UI, PDFs, emails) keep using doctor.full_name
--     unchanged — the column is still present in SELECT results.
--   - INSERT/UPDATE statements MUST NOT supply a value for full_name —
--     Postgres rejects writes to GENERATED columns. The four sites that
--     used to set full_name on insert have been updated in the same
--     change to drop that field.

BEGIN;

-- 1. Drop the sync trigger + function (no longer needed)
DROP TRIGGER IF EXISTS trg_larinova_doctors_sync_full_name ON larinova_doctors;
DROP FUNCTION IF EXISTS larinova_doctors_sync_full_name();

-- 2. Replace the column with a STORED generated column. Have to drop +
--    re-add because PostgreSQL doesn't allow converting an existing
--    column to GENERATED in place.
ALTER TABLE larinova_doctors DROP COLUMN full_name;

ALTER TABLE larinova_doctors
  ADD COLUMN full_name TEXT
    GENERATED ALWAYS AS (
      NULLIF(
        TRIM(BOTH ' ' FROM
          COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')
        ),
        ''
      )
    ) STORED;

COMMIT;
