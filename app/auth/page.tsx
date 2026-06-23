import { AuthFormClient } from "@/components/auth-form-client";
import { getServerUser } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";

export default async function AuthPage(props: { searchParams?: Promise<{ error?: string }> }) {
  const user = await getServerUser();
  if (user) redirect("/");

  const searchParams = await props.searchParams;
  const error = searchParams?.error;

  return (
    <section className="grid gap-10 pt-16">
      <div className="max-w-sm">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">Authentication</p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">Sign in to GatherMin</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-500">Sign in as the organizer to create invites and lock plans.</p>
      </div>
      <AuthFormClient />
      {error === "network_error" && (
        <p className="text-sm text-red-600">Could not reach Supabase. Check your internet connection or try a VPN.</p>
      )}
      {error === "auth_failed" && (
        <p className="text-sm text-red-600">Authentication failed. Please try again.</p>
      )}
    </section>
  );
}
