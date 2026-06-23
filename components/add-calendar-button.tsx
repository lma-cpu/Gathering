"use client";

import { Download } from "lucide-react";
import { createCalendarFile } from "@/lib/ics";
import type { FinalItinerary, HangoutSession } from "@/lib/types";

export function AddCalendarButton({ session, itinerary }: { session: HangoutSession; itinerary: FinalItinerary }) {
  function downloadCalendar() {
    const contents = createCalendarFile(session, itinerary);
    const blob = new Blob([contents], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gathermin.ics";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={downloadCalendar}
      className="inline-flex w-full items-center justify-center gap-2 border border-zinc-950 bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100 sm:w-auto"
    >
      <Download className="h-4 w-4" />
      Add to Calendar
    </button>
  );
}
