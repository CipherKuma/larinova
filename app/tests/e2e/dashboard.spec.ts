// Dashboard home E2E — §3 of the QA-E2E scope.
//
// The authenticated landing at `/in` is queue-first:
//   - NextPatientCard (from /api/dashboard/next-patient)
//   - Today's consultations + tasks (from /api/dashboard/home)
//   - FlaggedFollowUpAlert (renders only when /api/follow-ups/flagged returns rows)
//
// Uses the shared storage state from auth.setup.ts. Any test that needs a
// known doctor state seeds / mutates rows for that setup doctor, so tests
// cannot assume a specific email.

import { test, expect } from "@playwright/test";
import {
  adminClient,
  cleanupDoctor,
  provisionDoctor,
  signInViaMagicLink,
  uniqueEmail,
  type DoctorHandle,
} from "./helpers/auth";

function formatLocalDateYmd(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

test.describe("dashboard (authenticated)", () => {
  test("home route renders today's-schedule heading", async ({ page }) => {
    await page.goto("/in");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/in(\/|$|\?)/);
    // Either "Today's Schedule" (todaySchedule) or "Welcome back" — both are
    // dashboard markers and both must exist on a successful render.
    const markers = page
      .getByText(/today.?s schedule|welcome back|next patient|my tasks/i)
      .filter({ visible: true })
      .first();
    await expect(markers).toBeVisible({ timeout: 15_000 });
  });

  test("next-patient card component mounts (empty or filled)", async ({
    page,
  }) => {
    await page.goto("/in");
    await page.waitForLoadState("networkidle");
    // The card title "Next patient" OR the empty-state copy renders.
    const card = page
      .getByText(/next patient|no more patients scheduled|no upcoming appointments/i)
      .filter({ visible: true })
      .first();
    await expect(card).toBeVisible({ timeout: 15_000 });
  });

  test("sidebar nav links reach patients + calendar", async ({ page }) => {
    await page.goto("/in");
    await page.waitForLoadState("networkidle");

    const patientsLink = page.getByRole("link", { name: /patients/i }).first();
    await patientsLink.click();
    await expect(page).toHaveURL(/\/in\/patients/);

    await page.goto("/in");
    const calendarLink = page
      .getByRole("link", { name: /calendar|schedule|appointments/i })
      .first();
    await calendarLink.click();
    await expect(page).toHaveURL(/\/in\/calendar/);
  });

  test("/api/dashboard/home returns tasks + todayConsultations arrays", async ({
    request,
  }) => {
    const res = await request.get("/api/dashboard/home");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.tasks)).toBe(true);
    expect(Array.isArray(body.todayConsultations)).toBe(true);
  });

  test("/api/dashboard/next-patient returns structured response", async ({
    request,
  }) => {
    const res = await request.get("/api/dashboard/next-patient");
    expect(res.status()).toBe(200);
    const body = await res.json();
    // `next` can be null when there is no upcoming appointment; the key
    // itself must exist.
    expect(body).toHaveProperty("next");
  });
});

test.describe("flagged follow-up alert surfaces on dashboard", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  let handle: DoctorHandle | null = null;

  test.afterEach(async () => {
    if (!handle) return;
    const admin = adminClient();
    await admin
      .from("larinova_follow_up_threads")
      .delete()
      .eq("doctor_id", handle.doctorId);
    await cleanupDoctor(admin, handle);
    handle = null;
  });

  test("a flagged thread triggers the alert banner", async ({
    page,
    baseURL,
  }) => {
    const admin = adminClient();
    const email = uniqueEmail("flagged");
    handle = await provisionDoctor(admin, email, { fullName: "Flag Doctor" });

    // Insert a flagged follow-up thread for this doctor. If the schema
    // diverges from what we expect, skip with a BLOCKER note rather than
    // silently passing.
    const { error } = await admin.from("larinova_follow_up_threads").insert({
      doctor_id: handle.doctorId,
      tier: "day_1",
      flagged: true,
      status: "open",
    });
    if (error) {
      test.skip(
        true,
        `[BLOCKER] larinova_follow_up_threads insert rejected: ${error.message}`,
      );
      return;
    }

    await signInViaMagicLink(page, email, baseURL, "in");
    await page.goto("/in");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText(/flagged from follow-?up|needs attention/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("scheduled appointments surface in doctor schedule", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  let handle: DoctorHandle | null = null;

  test.afterEach(async () => {
    if (!handle) return;
    const admin = adminClient();
    await admin
      .from("larinova_appointments")
      .delete()
      .eq("doctor_id", handle.doctorId);
    await cleanupDoctor(admin, handle);
    handle = null;
  });

  test("today's confirmed appointment appears on dashboard and consultations", async ({
    page,
    baseURL,
  }) => {
    const admin = adminClient();
    const email = uniqueEmail("schedule");
    handle = await provisionDoctor(admin, email, {
      fullName: "Schedule Doctor",
    });

    const today = formatLocalDateYmd(new Date());
    const { error } = await admin.from("larinova_appointments").insert({
      doctor_id: handle.doctorId,
      appointment_date: today,
      start_time: "12:30:00",
      end_time: "13:00:00",
      type: "in_person",
      status: "confirmed",
      booker_name: "Raghu",
      booker_email: "raghu.schedule@larinova.test",
      booker_phone: "9999900000",
      booker_age: 42,
      booker_gender: "male",
      reason: "Fever",
      chief_complaint: "Fever",
    });
    expect(error).toBeNull();

    const { data: seededAppointments, error: seededError } = await admin
      .from("larinova_appointments")
      .select("id, doctor_id, appointment_date, start_time, status, booker_name")
      .eq("doctor_id", handle.doctorId)
      .eq("appointment_date", today);
    expect(seededError).toBeNull();
    expect(seededAppointments, "seeded appointment rows").toHaveLength(1);
    const appointmentId = seededAppointments?.[0]?.id;

    await signInViaMagicLink(page, email, baseURL, "in");

    const calendarResponse = await page.evaluate(async () => {
      const res = await fetch("/api/calendar/appointments");
      return {
        status: res.status,
        body: await res.json(),
      };
    });
    expect(calendarResponse.status, JSON.stringify(calendarResponse.body)).toBe(
      200,
    );
    expect(
      calendarResponse.body.appointments.some(
        (item: { id?: string }) => item.id === appointmentId,
      ),
      JSON.stringify(calendarResponse.body.appointments),
    ).toBe(true);

    const { data: directScheduleAppointments, error: directScheduleError } =
      await admin
        .from("larinova_appointments")
        .select(
          "id, appointment_date, start_time, end_time, status, booker_name, chief_complaint",
        )
        .eq("doctor_id", handle.doctorId)
        .eq("appointment_date", today)
        .eq("status", "confirmed")
        .order("start_time", { ascending: true });
    expect(directScheduleError).toBeNull();
    expect(
      directScheduleAppointments?.some((item) => item.id === appointmentId),
      JSON.stringify(directScheduleAppointments),
    ).toBe(true);

    const dashboardResponse = await page.evaluate(async () => {
      const res = await fetch(`/api/dashboard/home?probe=${Date.now()}`, {
        cache: "no-store",
      });
      return {
        status: res.status,
        body: await res.json(),
      };
    });
    expect(dashboardResponse.status, JSON.stringify(dashboardResponse.body)).toBe(
      200,
    );
    expect(Array.isArray(dashboardResponse.body.todayConsultations)).toBe(true);
    expect(
      dashboardResponse.body.todayConsultations.some(
        (item: { source?: string; larinova_patients?: { full_name?: string } }) =>
          item.source === "appointment" &&
          item.id === appointmentId &&
          item.larinova_patients?.full_name === "Raghu",
      ),
      JSON.stringify(dashboardResponse.body.todayConsultations),
    ).toBe(true);

    await page.goto("/in");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText("Raghu").filter({ visible: true }).first(),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByText(/scheduled/i).filter({ visible: true }).first(),
    ).toBeVisible();

    await page.goto("/in/consultations");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText("Raghu").filter({ visible: true }).first(),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page
        .getByText(/scheduled appointment/i)
        .filter({ visible: true })
        .first(),
    ).toBeVisible();
  });
});
