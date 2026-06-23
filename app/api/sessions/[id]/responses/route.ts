import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/server";

const responseSchema = z.object({
  friendName: z.string().trim().min(1),
  availableSlots: z.array(z.string()).default([]),
  chosenVibes: z.array(z.string()).default([]),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = responseSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Display name is required." }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();
  const { data: session, error: sessionError } = await supabase
    .from("hangout_sessions")
    .select("id,status")
    .eq("id", id)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  if (session.status !== "collecting") {
    return NextResponse.json({ error: "This session has already been finalized." }, { status: 409 });
  }

  const { friendName, availableSlots, chosenVibes } = parsed.data;
  const { data, error } = await supabase
    .from("friend_responses")
    .insert({
      session_id: id,
      friend_name: friendName,
      available_slots: availableSlots,
      chosen_vibes: chosenVibes,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
