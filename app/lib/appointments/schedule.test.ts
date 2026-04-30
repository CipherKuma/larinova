import { describe, expect, it } from "vitest";
import {
  appointmentToScheduleEntry,
  sortScheduleEntries,
} from "./schedule";

describe("appointment schedule mapping", () => {
  it("maps confirmed appointments into scheduled consultation-style entries", () => {
    const entry = appointmentToScheduleEntry({
      id: "appt-1",
      appointment_date: "2026-04-30",
      start_time: "12:30:00",
      end_time: "13:00:00",
      status: "confirmed",
      booker_name: "Raghu",
      chief_complaint: "Fever",
      larinova_patients: null,
    });

    expect(entry).toMatchObject({
      id: "appt-1",
      source: "appointment",
      consultation_code: "Scheduled appointment",
      start_time: "2026-04-30T12:30:00",
      end_time: "2026-04-30T13:00:00",
      status: "scheduled",
      chief_complaint: "Fever",
      larinova_patients: {
        full_name: "Raghu",
        patient_code: null,
      },
    });
  });

  it("sorts mixed schedule entries by start time", () => {
    const entries = sortScheduleEntries([
      {
        id: "later",
        source: "consultation",
        consultation_code: "K-2",
        start_time: "2026-04-30T15:00:00",
        end_time: null,
        status: "in_progress",
        chief_complaint: null,
        larinova_patients: null,
      },
      appointmentToScheduleEntry({
        id: "earlier",
        appointment_date: "2026-04-30",
        start_time: "12:30:00",
        end_time: "13:00:00",
        status: "confirmed",
        booker_name: "Raghu",
        chief_complaint: null,
        larinova_patients: null,
      }),
    ]);

    expect(entries.map((entry) => entry.id)).toEqual(["earlier", "later"]);
  });
});
