import { CreateInviteForm } from "@/components/create-invite-form";

export default function HomePage() {
  return (
    <section className="grid gap-12 pt-8 sm:pt-16">
      <div className="max-w-xl">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">Coordinate cleanly</p>
        <h1 className="text-5xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">Set the frame. Share the link.</h1>
        <p className="mt-6 max-w-md text-base leading-7 text-zinc-500">
          GatherMin collects availability and intent, then locks a simple plan everyone can open.
        </p>
      </div>
      <CreateInviteForm />
    </section>
  );
}
