-- =============================================================================
-- Larinova - Database Migrations for Language and Onboarding Features
-- =============================================================================
-- Run these migrations IN ORDER in your Supabase SQL Editor
-- =============================================================================

-- MIGRATION 1: Add language and onboarding_completed columns
-- =============================================================================
ALTER TABLE larinova_doctors
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ar'));

ALTER TABLE larinova_doctors
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_larinova_doctors_language ON larinova_doctors(language);

-- =============================================================================
-- MIGRATION 2: Update create_doctor_profile function
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_doctor_profile(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_specialization TEXT DEFAULT 'Not Specified',
  p_license_number TEXT DEFAULT NULL,
  p_language TEXT DEFAULT 'en',
  p_onboarding_completed BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_doctor_id UUID;
BEGIN
  -- Insert the doctor profile with new fields
  INSERT INTO larinova_doctors (
    user_id,
    email,
    full_name,
    specialization,
    license_number,
    language,
    onboarding_completed
  ) VALUES (
    p_user_id,
    p_email,
    p_full_name,
    p_specialization,
    p_license_number,
    p_language,
    p_onboarding_completed
  )
  RETURNING id INTO v_doctor_id;

  RETURN v_doctor_id;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.create_doctor_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_doctor_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO anon;

-- =============================================================================
-- MIGRATION 3: Update existing doctor records with default values
-- =============================================================================
-- This ensures existing doctors have the new fields populated
-- They will be marked as having completed onboarding (since they signed up before this feature)
UPDATE larinova_doctors
SET
  language = COALESCE(language, 'en'),
  onboarding_completed = COALESCE(onboarding_completed, TRUE)
WHERE language IS NULL OR onboarding_completed IS NULL;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these to verify the migrations worked correctly:

-- Check if columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'larinova_doctors'
  AND column_name IN ('language', 'onboarding_completed');

-- Check existing doctor records
SELECT id, email, full_name, specialization, language, onboarding_completed
FROM larinova_doctors
LIMIT 5;

-- =============================================================================
-- ROLLBACK (if needed)
-- =============================================================================
-- CAUTION: Only run this if you need to undo the migrations

/*
-- Remove the new columns
ALTER TABLE larinova_doctors DROP COLUMN IF EXISTS language;
ALTER TABLE larinova_doctors DROP COLUMN IF EXISTS onboarding_completed;

-- Drop the index
DROP INDEX IF EXISTS idx_larinova_doctors_language;

-- Restore old function signature (optional)
CREATE OR REPLACE FUNCTION public.create_doctor_profile(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_specialization TEXT,
  p_license_number TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_doctor_id UUID;
BEGIN
  INSERT INTO larinova_doctors (
    user_id,
    email,
    full_name,
    specialization,
    license_number
  ) VALUES (
    p_user_id,
    p_email,
    p_full_name,
    p_specialization,
    p_license_number
  )
  RETURNING id INTO v_doctor_id;

  RETURN v_doctor_id;
END;
$$;
*/

-- ============================================================
-- Calendar & Booking Feature Migration (2026-04-12)
-- ============================================================

-- Add columns to larinova_doctors
ALTER TABLE larinova_doctors
  ADD COLUMN IF NOT EXISTS booking_handle TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS booking_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS slot_duration_minutes INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS video_call_link TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'IN' CHECK (region IN ('IN', 'ID'));

-- Update existing doctors' region based on locale
UPDATE larinova_doctors SET region = 'ID' WHERE locale = 'id';
UPDATE larinova_doctors SET region = 'IN' WHERE locale != 'id' OR locale IS NULL;

-- Weekly availability template
CREATE TABLE IF NOT EXISTS larinova_doctor_availability (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id       UUID NOT NULL REFERENCES larinova_doctors(id) ON DELETE CASCADE,
  day_of_week     INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  is_active       BOOLEAN DEFAULT true,
  break_start     TIME,
  break_end       TIME,
  UNIQUE(doctor_id, day_of_week)
);

-- Booked appointments
CREATE TABLE IF NOT EXISTS larinova_appointments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id        UUID NOT NULL REFERENCES larinova_doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  start_time       TIME NOT NULL,
  end_time         TIME NOT NULL,
  type             TEXT NOT NULL CHECK (type IN ('video', 'in_person')),
  status           TEXT NOT NULL DEFAULT 'confirmed'
                     CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  booker_name      TEXT NOT NULL,
  booker_email     TEXT NOT NULL,
  booker_phone     TEXT NOT NULL,
  booker_age       INTEGER NOT NULL,
  booker_gender    TEXT NOT NULL
                     CHECK (booker_gender IN ('male','female','other','prefer_not_to_say')),
  reason           TEXT NOT NULL,
  chief_complaint  TEXT NOT NULL,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE larinova_doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE larinova_appointments ENABLE ROW LEVEL SECURITY;

-- Availability: doctors manage their own; public can read (needed for booking page API)
CREATE POLICY "doctors_manage_availability" ON larinova_doctor_availability
  FOR ALL USING (
    doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
  );
CREATE POLICY "public_read_availability" ON larinova_doctor_availability
  FOR SELECT USING (true);

-- Appointments: doctors see their own; public can insert (booking) and read own by id
CREATE POLICY "doctors_view_appointments" ON larinova_appointments
  FOR SELECT USING (
    doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
  );
CREATE POLICY "doctors_update_appointments" ON larinova_appointments
  FOR UPDATE USING (
    doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
  );
CREATE POLICY "public_insert_appointments" ON larinova_appointments
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- India OPD pilot (Team Tier) — 2026-04-23
-- ============================================================

-- Alpha doctor flags on larinova_doctors
ALTER TABLE larinova_doctors
  ADD COLUMN IF NOT EXISTS is_alpha BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS alpha_welcomed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_larinova_doctors_is_alpha
  ON larinova_doctors(is_alpha)
  WHERE is_alpha = true;

-- Allow 'whitelisted' subscription status
ALTER TABLE larinova_subscriptions
  DROP CONSTRAINT IF EXISTS larinova_subscriptions_status_check;

ALTER TABLE larinova_subscriptions
  ADD CONSTRAINT larinova_subscriptions_status_check
  CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'whitelisted'));
