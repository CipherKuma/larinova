-- ============================================================
-- Fix catastrophic RLS tenant-isolation hole (P0-1) — 2026-06-19
-- ============================================================
-- The original schema migration (20260123184843_create_kosyn_tables.sql)
-- shipped permissive RLS policies on every clinical table:
--
--   larinova_patients          SELECT/INSERT/UPDATE  USING/CHECK (true)
--   larinova_consultations     FOR ALL               USING (true)
--   larinova_transcripts       FOR ALL               USING (true)
--   larinova_prescriptions     FOR ALL               USING (true)
--   larinova_prescription_items FOR ALL              USING (true)
--   larinova_health_records    FOR ALL               USING (true)
--   larinova_insurance         FOR ALL               USING (true)  (table later dropped)
--
-- Postgres RLS policies are PERMISSIVE and OR'd together, so the
-- email-scoped patient-portal policies added in
-- 20260423103800_patient_portal_rls_policies.sql never took effect:
-- `USING (true) OR USING (email = jwt.email)` still evaluates to `true`.
--
-- Net effect today: the doctor app and the patient portal both use the
-- public anon key and rely on RLS for tenant isolation. With these
-- `true` policies live, ANY authenticated doctor — and ANY magic-link
-- patient — can read and write EVERY patient's PHI via PostgREST.
--
-- This migration:
--   1. DROPs every permissive `USING (true)` / `FOR ALL` policy named above.
--   2. Recreates doctor-scoped SELECT/INSERT/UPDATE/DELETE policies using
--      the canonical idiom already correct on larinova_documents /
--      larinova_appointments / larinova_patient_narrative:
--        doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
--      For tables without a direct doctor_id (transcripts, prescription
--      items) the scope is resolved through the parent
--      consultation / prescription.
--   3. PRESERVES the patient-portal patient-facing read policies
--      (patient_self_select, patient_view_own_rx, patient_view_own_rx_items,
--      etc. from 20260423103800). Those coexist (OR) with the doctor
--      policies, which is exactly correct: a doctor sees their patients'
--      rows, a patient sees their own rows.
--   4. Tightens the `patient-documents` storage.objects policies so a
--      patient can only read/write objects under an appointment path
--      prefix that belongs to them (the originals admitted any
--      authenticated session — see patient-portal/RLS-POLICIES-NEEDED.md).
--
-- The service-role admin client (createAdminClient) bypasses RLS, so
-- server-side agent/dispatcher writes are unaffected. Doctor-app server
-- reads run as the doctor's authenticated user, so auth.uid() resolves
-- to their larinova_doctors row and these policies admit their own data.
--
-- NB: this file is forward-only and does NOT touch any earlier migration.
-- Apply + verify against the production DB:
--   select tablename, policyname, qual
--     from pg_policies where tablename like 'larinova_%' order by 1,2;

-- ============================================================
-- 1. larinova_patients
-- ============================================================
-- A doctor "owns" a patient they created, and must also be able to read
-- patients linked to them via an appointment or a consultation (existing
-- patients can be attached to a new consult / booked across doctors). This
-- mirrors larinova_patient_narrative / larinova_patient_documents scoping.

DROP POLICY IF EXISTS "Doctors can view all patients" ON larinova_patients;
DROP POLICY IF EXISTS "Doctors can insert patients" ON larinova_patients;
DROP POLICY IF EXISTS "Doctors can update patients" ON larinova_patients;

CREATE POLICY "doctors_view_own_patients"
  ON larinova_patients FOR SELECT
  TO authenticated
  USING (
    created_by_doctor_id IN (
      SELECT id FROM larinova_doctors WHERE user_id = auth.uid()
    )
    OR id IN (
      SELECT patient_id FROM larinova_appointments
      WHERE doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
    )
    OR id IN (
      SELECT patient_id FROM larinova_consultations
      WHERE doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
    )
  );

-- Insert: the new patient must be stamped with the calling doctor's id
-- (the consultations/start + patient-create routes already set
-- created_by_doctor_id to the authenticated doctor).
CREATE POLICY "doctors_insert_own_patients"
  ON larinova_patients FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by_doctor_id IN (
      SELECT id FROM larinova_doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "doctors_update_own_patients"
  ON larinova_patients FOR UPDATE
  TO authenticated
  USING (
    created_by_doctor_id IN (
      SELECT id FROM larinova_doctors WHERE user_id = auth.uid()
    )
    OR id IN (
      SELECT patient_id FROM larinova_appointments
      WHERE doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
    )
    OR id IN (
      SELECT patient_id FROM larinova_consultations
      WHERE doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
    )
  );

-- ============================================================
-- 2. larinova_consultations (direct doctor_id)
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can manage consultations" ON larinova_consultations;

CREATE POLICY "doctors_view_own_consultations"
  ON larinova_consultations FOR SELECT
  TO authenticated
  USING (
    doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
  );

CREATE POLICY "doctors_insert_own_consultations"
  ON larinova_consultations FOR INSERT
  TO authenticated
  WITH CHECK (
    doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
  );

CREATE POLICY "doctors_update_own_consultations"
  ON larinova_consultations FOR UPDATE
  TO authenticated
  USING (
    doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
  );

CREATE POLICY "doctors_delete_own_consultations"
  ON larinova_consultations FOR DELETE
  TO authenticated
  USING (
    doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
  );

-- ============================================================
-- 3. larinova_transcripts (scoped via parent consultation)
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can manage transcripts" ON larinova_transcripts;

CREATE POLICY "doctors_view_own_transcripts"
  ON larinova_transcripts FOR SELECT
  TO authenticated
  USING (
    consultation_id IN (
      SELECT id FROM larinova_consultations
      WHERE doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "doctors_insert_own_transcripts"
  ON larinova_transcripts FOR INSERT
  TO authenticated
  WITH CHECK (
    consultation_id IN (
      SELECT id FROM larinova_consultations
      WHERE doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "doctors_update_own_transcripts"
  ON larinova_transcripts FOR UPDATE
  TO authenticated
  USING (
    consultation_id IN (
      SELECT id FROM larinova_consultations
      WHERE doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "doctors_delete_own_transcripts"
  ON larinova_transcripts FOR DELETE
  TO authenticated
  USING (
    consultation_id IN (
      SELECT id FROM larinova_consultations
      WHERE doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
    )
  );

-- ============================================================
-- 4. larinova_prescriptions (direct doctor_id)
-- ============================================================
-- NB: keep the patient-portal SELECT policy patient_view_own_rx
-- (from 20260423103800) untouched — it OR-coexists with these.
DROP POLICY IF EXISTS "Authenticated users can manage prescriptions" ON larinova_prescriptions;

CREATE POLICY "doctors_view_own_prescriptions"
  ON larinova_prescriptions FOR SELECT
  TO authenticated
  USING (
    doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
  );

CREATE POLICY "doctors_insert_own_prescriptions"
  ON larinova_prescriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
  );

CREATE POLICY "doctors_update_own_prescriptions"
  ON larinova_prescriptions FOR UPDATE
  TO authenticated
  USING (
    doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
  );

CREATE POLICY "doctors_delete_own_prescriptions"
  ON larinova_prescriptions FOR DELETE
  TO authenticated
  USING (
    doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
  );

-- ============================================================
-- 5. larinova_prescription_items (scoped via parent prescription)
-- ============================================================
-- NB: keep the patient-portal SELECT policy patient_view_own_rx_items
-- (from 20260423103800) untouched — it OR-coexists with these.
DROP POLICY IF EXISTS "Authenticated users can manage prescription items" ON larinova_prescription_items;

CREATE POLICY "doctors_view_own_prescription_items"
  ON larinova_prescription_items FOR SELECT
  TO authenticated
  USING (
    prescription_id IN (
      SELECT id FROM larinova_prescriptions
      WHERE doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "doctors_insert_own_prescription_items"
  ON larinova_prescription_items FOR INSERT
  TO authenticated
  WITH CHECK (
    prescription_id IN (
      SELECT id FROM larinova_prescriptions
      WHERE doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "doctors_update_own_prescription_items"
  ON larinova_prescription_items FOR UPDATE
  TO authenticated
  USING (
    prescription_id IN (
      SELECT id FROM larinova_prescriptions
      WHERE doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "doctors_delete_own_prescription_items"
  ON larinova_prescription_items FOR DELETE
  TO authenticated
  USING (
    prescription_id IN (
      SELECT id FROM larinova_prescriptions
      WHERE doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
    )
  );

-- ============================================================
-- 6. larinova_health_records (direct doctor_id)
-- ============================================================
-- doctor_id is nullable (ON DELETE SET NULL); records authored by the
-- calling doctor are stamped with their id. Records authored by another
-- doctor for a shared patient are intentionally NOT visible here (PHI
-- minimisation) — the patient-narrative summary is the cross-doctor view.
DROP POLICY IF EXISTS "Authenticated users can manage health records" ON larinova_health_records;

CREATE POLICY "doctors_view_own_health_records"
  ON larinova_health_records FOR SELECT
  TO authenticated
  USING (
    doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
  );

CREATE POLICY "doctors_insert_own_health_records"
  ON larinova_health_records FOR INSERT
  TO authenticated
  WITH CHECK (
    doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
  );

CREATE POLICY "doctors_update_own_health_records"
  ON larinova_health_records FOR UPDATE
  TO authenticated
  USING (
    doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
  );

CREATE POLICY "doctors_delete_own_health_records"
  ON larinova_health_records FOR DELETE
  TO authenticated
  USING (
    doctor_id IN (SELECT id FROM larinova_doctors WHERE user_id = auth.uid())
  );

-- ============================================================
-- 7. larinova_insurance — defensive drop only
-- ============================================================
-- The table was removed in 20260427110000_drop_larinova_insurance.sql
-- (DROP TABLE ... CASCADE), which already removed its permissive policy.
-- This guarded block drops the policy only if the table still exists on a
-- DB where the drop migration has not yet run, so this migration is safe to
-- apply in any order. We deliberately do NOT recreate any policy: the table
-- is out of the v1 spec.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'larinova_insurance'
  ) THEN
    DROP POLICY IF EXISTS "Authenticated users can view insurance" ON larinova_insurance;
  END IF;
END $$;

-- ============================================================
-- 8. storage.objects — tighten the 'patient-documents' bucket
-- ============================================================
-- The originals (20260423103800) admitted ANY authenticated session to
-- read/write the entire bucket. Patient-portal uploads key objects as
-- `{appointment_id}/{ts}-{filename}` (see AppointmentActions.tsx), so the
-- first path segment is the appointment id. Scope patient access to objects
-- whose first folder belongs to an appointment booked by the caller
-- (by booker_email, or by the patient row matching their JWT email).
--
-- Server-side agent writes (dispatcher) use the service-role client and
-- bypass RLS, so they are unaffected by this tightening.

DROP POLICY IF EXISTS "patient_upload_own_documents" ON storage.objects;
CREATE POLICY "patient_upload_own_documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'patient-documents'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM larinova_appointments
      WHERE booker_email = (auth.jwt() ->> 'email')
         OR patient_id IN (
           SELECT id FROM larinova_patients
           WHERE email = (auth.jwt() ->> 'email')
         )
    )
  );

DROP POLICY IF EXISTS "patient_read_own_documents" ON storage.objects;
CREATE POLICY "patient_read_own_documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'patient-documents'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM larinova_appointments
      WHERE booker_email = (auth.jwt() ->> 'email')
         OR patient_id IN (
           SELECT id FROM larinova_patients
           WHERE email = (auth.jwt() ->> 'email')
         )
    )
  );

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
