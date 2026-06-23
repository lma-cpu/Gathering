"use client";

import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const slots = [
  "Friday Morning",
  "Friday Afternoon",
  "Friday Evening",
  "Saturday Morning",
  "Saturday Afternoon",
  "Saturday Evening",
  "Sunday Morning",
  "Sunday Afternoon",
  "Sunday Evening",
];

const vibes = ["#AestheticCafe", "#CozyDinner", "#BarNight", "#OutdoorPark", "#Museum", "#ActiveEnergy"];

export function ContributionForm({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [friendName, setFriendName] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [chosenVibes, setChosenVibes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleSlot(slot: string) {
    setAvailableSlots((current) => (current.includes(slot) ? current.filter((item) => item !== slot) : [...current, slot]));
  }

  function toggleVibe(vibe: string) {
    setChosenVibes((current) => (current.includes(vibe) ? current.filter((item) => item !== vibe) : [...current, vibe]));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/sessions/${sessionId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendName, availableSlots, chosenVibes }),
      });
      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error || "Could not submit response.");

      setFriendName("");
      setAvailableSlots([]);
      setChosenVibes([]);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not submit response.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
      <label className="grid gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">Display name *</span>
        <input
          required
          value={friendName}
          placeholder="Sam"
          onChange={(event) => setFriendName(event.target.value)}
          className="border-0 border-b border-zinc-200 bg-transparent px-0 py-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-300 focus:border-zinc-950"
        />
      </label>

      <fieldset>
        <legend className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">Availability</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {slots.map((slot) => {
            const selected = availableSlots.includes(slot);
            return (
              <button
                key={slot}
                type="button"
                onClick={() => toggleSlot(slot)}
                className={`min-h-16 border px-3 py-3 text-left text-xs font-medium transition ${
                  selected ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-400"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">Vibes</legend>
        <div className="flex flex-wrap gap-2">
          {vibes.map((vibe) => {
            const selected = chosenVibes.includes(vibe);
            return (
              <button
                key={vibe}
                type="button"
                onClick={() => toggleVibe(vibe)}
                className={`border px-3 py-2 font-mono text-xs transition ${
                  selected ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
                }`}
              >
                {vibe}
              </button>
            );
          })}
        </div>
      </fieldset>

      <button
        disabled={loading || !friendName}
        className="inline-flex w-full items-center justify-center gap-2 border border-zinc-950 bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Submit
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
