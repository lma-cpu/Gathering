import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerUser } from "@/lib/supabase/server-client";
import { createSupabaseAdmin } from "@/lib/supabase/server";

const createSessionSchema = z.object({
  creatorName: z.string().trim().min(1),
  city: z.string().trim().min(1),
  title: z.string().trim().optional(),
  dateRange: z.string().trim().optional(),
});

export async function POST(request: Request) {
  const parsed = createSessionSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Creator name and city are required." }, { status: 400 });
  }

  const { creatorName, city, title, dateRange } = parsed.data;
  const user = await getServerUser();
  const supabase = createSupabaseAdmin();

  const payload: Record<string, unknown> = {
    creator_name: creatorName,
    city,
    title: title || null,
    date_range: dateRange || null,
    status: "collecting",
  };

  if (user?.id) {
    payload.creator_id = user.id;
  }

  const { data, error } = await supabase
    .from("hangout_sessions")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    if (error.message?.includes("creator_id") && payload.creator_id) {
      delete payload.creator_id;
      const retry = await supabase
        .from("hangout_sessions")
        .insert(payload)
        .select("*")
        .single();
      if (!retry.error) return NextResponse.json(retry.data);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
