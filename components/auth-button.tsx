"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

export function AuthButton({ email }: { email: string | null }) {
  const router = useRouter();
  const supabase = createSupabaseClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.refresh();
  }

  if (!email) {
    return (
      <a
        href="/auth"
        className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 transition hover:text-zinc-950"
      >
        Sign in
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-xs text-zinc-400 sm:block">{email}</span>
      <button
        onClick={signOut}
        className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 transition hover:text-zinc-950"
      >
        <LogOut className="h-3 w-3" />
        Sign out
      </button>
    </div>
  );
}
