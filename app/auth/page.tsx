import { AuthFormClient } from "@/components/auth-form-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";

export default async function AuthPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/");

  return (
    <section className="grid gap-10 pt-16">
      <div className="max-w-sm">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">Authentication</p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">Sign in to GatherMin</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-500">Sign in as the organizer to create invites and lock plans.</p>
      </div>
      <AuthFormClient />
    </section>
  );
}
