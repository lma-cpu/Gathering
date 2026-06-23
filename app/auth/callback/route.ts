import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const TIMEOUT = 30000;

async function fetchWithTimeout(
  url: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(
              cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[],
              headers: Record<string, string>,
            ) {
              cookiesToSet.forEach(({ name, value }) => {
                request.cookies.set(name, value);
              });
              Object.entries(headers).forEach(([key, value]) => {
                request.headers.set(key, value);
              });
            },
          },
          fetch: fetchWithTimeout,
        } as any,
      );

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        const response = NextResponse.redirect(`${origin}${next}`);
        request.cookies.getAll().forEach(({ name, value }) => {
          response.cookies.set(name, value, { path: "/" });
        });
        return response;
      }

      return NextResponse.redirect(`${origin}/auth?error=auth_failed`);
    } catch {
      return NextResponse.redirect(`${origin}/auth?error=network_error`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=invalid_request`);
}
