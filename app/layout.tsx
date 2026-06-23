import type { Metadata } from "next";
import "./globals.css";
import { AuthButton } from "@/components/auth-button";
import { getServerUser } from "@/lib/supabase/server-client";

export const metadata: Metadata = {
  title: "GatherMin",
  description: "Coordinate group hangouts with less noise.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-zinc-50">
          <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-6 sm:px-8 sm:py-10">
            <a href="/" className="font-mono text-sm font-medium uppercase tracking-[0.22em] text-zinc-950">
              GatherMin
            </a>
            <AuthButton email={user?.email ?? null} />
          </header>
          <main className="mx-auto w-full max-w-3xl px-5 pb-20 sm:px-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
