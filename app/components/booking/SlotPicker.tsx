"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SlotPickerProps {
  handle: string;
  onSlotSelected: (date: string, time: string) => void;
  locale: "en" | "id";
}

const DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function SlotPicker({
  handle,
  onSlotSelected,
  locale,
}: SlotPickerProps) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const days = locale === "id" ? DAYS_ID : DAYS_EN;
  const months = locale === "id" ? MONTHS_ID : MONTHS_EN;

  const loadSlots = useCallback(
    async (date: string) => {
      setLoadingSlots(true);
      setSlotsError(false);
      setSelectedSlot(null);
      try {
        const res = await fetch(`/api/booking/${handle}/slots?date=${date}`);
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const d = await res.json();
        setSlots(d.slots ?? []);
      } catch {
        // Distinguish a real failure from a genuinely empty day so we don't
        // show "no slots" when the request actually errored.
        setSlots([]);
        setSlotsError(true);
      } finally {
        setLoadingSlots(false);
      }
    },
    [handle],
  );

  useEffect(() => {
    if (!selectedDate) return;
    loadSlots(selectedDate);
  }, [selectedDate, loadSlots]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = toYMD(new Date());

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleDayClick = (day: number) => {
    const d = toYMD(new Date(year, month, day));
    if (d < today) return;
    setSelectedDate(d);
    setSlots([]);
  };

  const handleSlotClick = (slot: string) => {
    setSelectedSlot(slot);
    if (selectedDate) onSlotSelected(selectedDate, slot);
  };

  const noSlotMsg =
    locale === "id"
      ? "Tidak ada slot tersedia pada tanggal ini"
      : "No available slots on this date";

  const errorMsg =
    locale === "id"
      ? "Tidak dapat memuat slot. Silakan coba lagi."
      : "Couldn't load slots. Please try again.";

  const retryLabel = locale === "id" ? "Coba lagi" : "Retry";

  return (
    <div className="flex flex-col gap-4">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-foreground">
          {months[month]} {year}
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day labels + calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => (
          <div
            key={d}
            className="text-center text-xs text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const ymd = toYMD(new Date(year, month, day));
          const isPast = ymd < today;
          const isSelected = ymd === selectedDate;
          return (
            <button
              key={ymd}
              type="button"
              disabled={isPast}
              onClick={() => handleDayClick(day)}
              className={`text-center text-sm py-1.5 rounded-lg transition-colors
                ${isPast ? "text-muted-foreground/40 cursor-not-allowed" : "hover:bg-accent cursor-pointer"}
                ${isSelected ? "bg-primary text-primary-foreground hover:bg-primary" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Slot grid */}
      {selectedDate && (
        <div className="mt-2">
          {loadingSlots ? (
            <div className="grid grid-cols-3 gap-2">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-9 bg-muted animate-pulse rounded-lg"
                  />
                ))}
            </div>
          ) : slotsError ? (
            <div className="flex flex-col items-start gap-2 rounded-lg border-l-4 border-destructive bg-destructive/10 p-3">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedDate && loadSlots(selectedDate)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {retryLabel}
              </Button>
            </div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">{noSlotMsg}</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => handleSlotClick(slot)}
                  className={`text-sm py-2 rounded-lg border transition-colors
                    ${
                      selectedSlot === slot
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary hover:text-primary"
                    }
                  `}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
