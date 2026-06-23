"use client";

import { Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LockSynthesizeButton({ sessionId, disabled }: { sessionId: string; disabled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function synthesize() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/sessions/${sessionId}/synthesize`, { method: "POST" });
      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error || "Could not synthesize.");

      router.push(`/hangout/${sessionId}/results`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not synthesize.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={synthesize}
        disabled={disabled || loading}
        className="inline-flex w-full items-center justify-center gap-2 border border-zinc-950 bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        Lock & Synthesize
      </button>
      {disabled ? <p className="mt-3 text-xs leading-5 text-zinc-500">Collect at least one response first.</p> : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
