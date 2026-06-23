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

  const { data, error } = await supabase
    .from("hangout_sessions")
    .insert({
      creator_name: creatorName,
      city,
      title: title || null,
      date_range: dateRange || null,
      status: "collecting",
      creator_id: user?.id ?? null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
