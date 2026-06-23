import { notFound, redirect } from "next/navigation";
import { ContributionForm } from "@/components/contribution-form";
import { LockSynthesizeButton } from "@/components/lock-synthesize-button";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { FriendResponse, HangoutSession } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HangoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseAdmin();

  const { data: session } = await supabase.from("hangout_sessions").select("*").eq("id", id).single<HangoutSession>();
  if (!session) notFound();

  if (session.status === "finalized") {
    redirect(`/hangout/${id}/results`);
  }

  const { data: responsesRaw } = await supabase
    .from("friend_responses")
    .select("*")
    .eq("session_id", id)
    .order("created_at", { ascending: true })
    .returns<FriendResponse[]>();
  const responses = responsesRaw ?? [];

  return (
    <section className="grid gap-10 pt-6 sm:pt-14">
      <div>
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">Collecting</p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">{session.title || "Group hangout"}</h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-zinc-500">
          {session.creator_name} is gathering preferences for {session.city}
          {session.date_range ? `, ${session.date_range}` : ""}.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <ContributionForm sessionId={id} />
        <aside className="border border-zinc-200 bg-zinc-100/60 p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">Responses</h2>
            <span className="text-sm font-medium text-zinc-950">{responses.length}</span>
          </div>
          <div className="mt-6 grid gap-3">
            {responses.length ? (
              responses.map((response) => (
                <div key={response.id} className="border border-zinc-200 bg-white p-4">
                  <p className="font-medium text-zinc-950">{response.friend_name}</p>
                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    {response.available_slots.length ? response.available_slots.join(", ") : "No availability selected"}
                    <br />
                    {response.chosen_vibes.length ? response.chosen_vibes.join(", ") : "No vibes selected"}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-8 text-sm text-zinc-400">No responses yet.</p>
            )}
          </div>
          <div className="mt-6 border-t border-zinc-200 pt-6">
            <LockSynthesizeButton sessionId={id} disabled={!responses.length} />
          </div>
        </aside>
      </div>
    </section>
  );
}
