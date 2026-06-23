import type { FinalItinerary, HangoutSession } from "@/lib/types";

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

export function createCalendarFile(session: HangoutSession, itinerary: FinalItinerary) {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GatherMin//Hangout//EN",
    "BEGIN:VEVENT",
    `UID:${session.id}@gathermin`,
    `DTSTAMP:${now}`,
    `SUMMARY:${escapeIcsText(session.title || "GatherMin Hangout")}`,
    `LOCATION:${escapeIcsText(`${itinerary.venue_name}, ${itinerary.venue_address}, ${session.city}`)}`,
    `DESCRIPTION:${escapeIcsText(`${itinerary.selected_date} ${itinerary.selected_time}\n\n${itinerary.ai_reasoning}`)}`,
    `URL:${itinerary.google_maps_url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");
}
