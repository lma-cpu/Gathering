import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/server";

const itinerarySchema = z.object({
  selectedDate: z.string().min(1),
  selectedTime: z.string().min(1),
  venueName: z.string().min(1),
  venueAddress: z.string().min(1),
  weatherCondition: z.string().optional(),
  aiReasoning: z.string().min(1),
});

async function getWeatherText(city: string) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return "Weather unavailable";

  const url = new URL("https://api.openweathermap.org/data/2.5/forecast");
  url.searchParams.set("q", city);
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", "imperial");

  const response = await fetch(url, { next: { revalidate: 900 } });
  if (!response.ok) return "Weather forecast unavailable for this city.";

  const payload = await response.json();
  const forecasts = Array.isArray(payload.list) ? payload.list.slice(0, 10) : [];

  return forecasts
    .map((item: any) => {
      const time = item.dt_txt || "upcoming";
      const condition = item.weather?.[0]?.description || "unknown";
      const temp = item.main?.temp ? `${Math.round(item.main.temp)} F` : "unknown temp";
      return `${time}: ${condition}, ${temp}`;
    })
    .join("\n");
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseAdmin();

  const { data: session, error: sessionError } = await supabase
    .from("hangout_sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("final_itineraries")
    .select("*")
    .eq("session_id", id)
    .maybeSingle();

  if (session.status === "finalized" && existing) {
    return NextResponse.json(existing);
  }

  const { data: responses, error: responsesError } = await supabase
    .from("friend_responses")
    .select("*")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  if (responsesError) {
    return NextResponse.json({ error: responsesError.message }, { status: 500 });
  }

  if (!responses?.length) {
    return NextResponse.json({ error: "At least one response is required before synthesis." }, { status: 400 });
  }

  const weatherText = await getWeatherText(session.city);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-pro";

  const prompt = `You are GatherMin's event synthesis engine. Pick one practical hangout plan.

Session data:
City: ${session.city}
Title: ${session.title || "Untitled Hangout"}
Date range: ${session.date_range || "Not specified"}

Weather in ${session.city}:
${weatherText}

Friend responses:
${responses
  .map(
    (r: any) =>
      `- ${r.friend_name}: Vibes [${r.chosen_vibes?.join(", ") || "none"}], Available [${r.available_slots?.join(", ") || "none"}]`,
  )
  .join("\n")}

Based on the above, choose the single best date, time window, and a real specific venue that fits the group's collective preferences, availability, and vibes. Return ONLY valid JSON matching this schema:
{
  "selectedDate": "short human-readable date like Saturday, Oct 24",
  "selectedTime": "locked time window like 7:00 PM",
  "venueName": "specific real venue name in ${session.city}",
  "venueAddress": "street address or neighborhood of the venue",
  "weatherCondition": "short weather summary for the chosen date",
  "aiReasoning": "one tight paragraph explaining why this plan fits the group"
}`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        }),
      },
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      return NextResponse.json({ error: `Gemini API error: ${geminiRes.status} ${errBody}` }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json({ error: "Gemini returned an empty response." }, { status: 502 });
    }

    const cleanJson = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = itinerarySchema.safeParse(JSON.parse(cleanJson));

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Gemini returned an invalid itinerary.", raw: rawText },
        { status: 502 },
      );
    }

    const itinerary = parsed.data;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${itinerary.venueName} ${session.city}`,
    )}`;

    const { data: saved, error: saveError } = await supabase
      .from("final_itineraries")
      .insert({
        session_id: id,
        selected_date: itinerary.selectedDate,
        selected_time: itinerary.selectedTime,
        venue_name: itinerary.venueName,
        venue_address: itinerary.venueAddress,
        google_maps_url: googleMapsUrl,
        weather_condition: itinerary.weatherCondition || weatherText.split("\n")[0] || "Weather unavailable",
        ai_reasoning: itinerary.aiReasoning,
      })
      .select("*")
      .single();

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    await supabase.from("hangout_sessions").update({ status: "finalized" }).eq("id", id);

    return NextResponse.json(saved);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Synthesis failed." }, { status: 500 });
  }
}
