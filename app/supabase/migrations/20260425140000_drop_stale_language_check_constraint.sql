-- Drop the stale `larinova_doctors_language_check` constraint.
-- It was auto-created by 20260126000001 (CHECK language IN ('en','ar')), then the
-- column was renamed to `locale` by 20260412120000_locale_split.sql. Postgres
-- auto-updates the constraint to point at the new column name but does NOT
-- rename the constraint, so we ended up with two contradictory checks on
-- `locale`: the old `language_check` (expects 'en','ar') and the new
-- `locale_valid` (expects 'in','id'). Any new doctor row violates one of them.
--
-- E2E-confirmed bug: doctor creation fails with
--   ERROR: new row for relation "larinova_doctors" violates check constraint
--          "larinova_doctors_language_check"

ALTER TABLE larinova_doctors
  DROP CONSTRAINT IF EXISTS larinova_doctors_language_check;
