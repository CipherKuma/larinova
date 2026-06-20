-- ============================================================
-- Fix RLS recursion on larinova_patients (follow-up to 20260619000000)
-- ============================================================
-- 20260619000000 scoped larinova_patients SELECT/UPDATE with an
-- `id IN (SELECT patient_id FROM larinova_appointments WHERE ...)` clause.
-- larinova_appointments' own policy (patient_view_own_appointments, from
-- 20260423103800) references larinova_patients in return — so evaluating the
-- patients policy triggers the appointments policy which triggers the patients
-- policy again: Postgres raises "infinite recursion detected in policy for
-- relation larinova_patients" on EVERY patients query, breaking the app.
--
-- Fix: compute the set of patient ids a doctor may access inside a
-- SECURITY DEFINER function. Such a function runs as its owner (postgres),
-- which bypasses RLS on the inner reads, so the appointments/consultations
-- lookups no longer re-enter RLS and the cycle is broken. The patients
-- policies then just test membership in that id set.
--
-- The patient-facing policy (patient_self_select, email-scoped) is unchanged
-- and continues to OR-coexist, so a portal patient still sees their own row.

create or replace function public.larinova_accessible_patient_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  -- patients the doctor created
  select id
    from larinova_patients
   where created_by_doctor_id in (
           select id from larinova_doctors where user_id = auth.uid()
         )
  union
  -- patients linked to the doctor through an appointment
  select patient_id
    from larinova_appointments
   where patient_id is not null
     and doctor_id in (
           select id from larinova_doctors where user_id = auth.uid()
         )
  union
  -- patients linked to the doctor through a consultation
  select patient_id
    from larinova_consultations
   where patient_id is not null
     and doctor_id in (
           select id from larinova_doctors where user_id = auth.uid()
         )
$$;

revoke all on function public.larinova_accessible_patient_ids() from public, anon;
grant execute on function public.larinova_accessible_patient_ids() to authenticated;

-- Replace the recursive SELECT/UPDATE policies with non-recursive ones.
drop policy if exists "doctors_view_own_patients" on larinova_patients;
create policy "doctors_view_own_patients"
  on larinova_patients for select
  to authenticated
  using ( id in (select public.larinova_accessible_patient_ids()) );

drop policy if exists "doctors_update_own_patients" on larinova_patients;
create policy "doctors_update_own_patients"
  on larinova_patients for update
  to authenticated
  using ( id in (select public.larinova_accessible_patient_ids()) );

-- INSERT policy (doctors_insert_own_patients) references no other table, so it
-- never recursed and is left as-is.
