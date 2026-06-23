import { Calendar, Cloud, MapPin } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { AddCalendarButton } from "@/components/add-calendar-button";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { FinalItinerary, HangoutSession } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseAdmin();

  const { data: session } = await supabase.from("hangout_sessions").select("*").eq("id", id).single<HangoutSession>();
  if (!session) notFound();

  const { data: itinerary } = await supabase.from("final_itineraries").select("*").eq("session_id", id).maybeSingle<FinalItinerary>();

  if (!itinerary) {
    redirect(`/hangout/${id}`);
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${itinerary.venue_name} ${session.city}`)}`;

  return (
    <section className="grid gap-10 pt-6 sm:pt-14">
      <div className="max-w-xl">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">Final plan</p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">{session.title || "GatherMin plan"}</h1>
      </div>

      <div className="border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="grid gap-8">
          <div className="grid gap-2 border-b border-zinc-100 pb-8">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
              <Calendar className="h-4 w-4" />
              Date
            </div>
            <p className="text-3xl font-semibold tracking-tight text-zinc-950">{itinerary.selected_date}</p>
            <p className="text-base text-zinc-500">{itinerary.selected_time}</p>
          </div>

          <div className="grid gap-3 border-b border-zinc-100 pb-8">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
              <MapPin className="h-4 w-4" />
              Venue
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="group border border-zinc-950 bg-zinc-950 px-5 py-4 text-white transition hover:bg-zinc-800"
            >
              <span className="block text-xl font-semibold tracking-tight">{itinerary.venue_name}</span>
              <span className="mt-1 block text-sm text-zinc-300">{itinerary.venue_address}</span>
            </a>
          </div>

          <div className="grid gap-3 border-b border-zinc-100 pb-8">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
              <Cloud className="h-4 w-4" />
              Weather
            </div>
            <p className="text-base text-zinc-700">{itinerary.weather_condition}</p>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">Rationale</p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-600">{itinerary.ai_reasoning}</p>
          </div>

          <AddCalendarButton session={session} itinerary={itinerary} />
        </div>
      </div>
    </section>
  );
}
