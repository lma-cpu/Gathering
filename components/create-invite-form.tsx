"use client";

import { Check, Copy, Loader2, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function CreateInviteForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [form, setForm] = useState({
    creatorName: "",
    city: "",
    title: "",
    dateRange: "",
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error || "Could not create invite.");

      setInviteUrl(`${window.location.origin}/hangout/${payload.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create invite.");
    } finally {
      setLoading(false);
    }
  }

  async function copyInvite() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  if (inviteUrl) {
    const path = new URL(inviteUrl).pathname;

    return (
      <div className="border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-950 bg-zinc-950 text-white">
          <Check className="h-4 w-4" />
        </div>
        <h2 className="mt-8 text-2xl font-semibold tracking-tight text-zinc-950">Invite ready.</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">Share this link with the group. Each person can respond without an account.</p>
        <div className="mt-8 flex items-stretch border border-zinc-200 bg-zinc-50">
          <code className="min-w-0 flex-1 truncate px-4 py-3 text-xs text-zinc-600">{inviteUrl}</code>
          <button onClick={copyInvite} className="border-l border-zinc-200 px-4 text-zinc-950 transition hover:bg-white" aria-label="Copy invite link">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <button onClick={() => router.push(path)} className="mt-5 w-full border border-zinc-950 bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800">
          Open invite
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
      <Field label="Your name" value={form.creatorName} required placeholder="Alex" onChange={(creatorName) => setForm((value) => ({ ...value, creatorName }))} />
      <Field label="Target city" value={form.city} required placeholder="Seattle, WA" onChange={(city) => setForm((value) => ({ ...value, city }))} />
      <Field label="Title" value={form.title} placeholder="Saturday dinner" onChange={(title) => setForm((value) => ({ ...value, title }))} />
      <Field label="Date range" value={form.dateRange} placeholder="This weekend" onChange={(dateRange) => setForm((value) => ({ ...value, dateRange }))} />
      <button
        disabled={loading || !form.creatorName || !form.city}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-zinc-950 bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Generate Invite
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}

function Field({
  label,
  value,
  placeholder,
  required,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="border-0 border-b border-zinc-200 bg-transparent px-0 py-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-300 focus:border-zinc-950"
      />
    </label>
  );
}
