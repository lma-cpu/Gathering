import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    try {
      const tokenRes = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=authorization_code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({
            code,
            redirect_uri: `${origin}/auth/callback`,
          }),
          signal: AbortSignal.timeout(30000),
        },
      );

      if (tokenRes.ok) {
        const data = await tokenRes.json();
        const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;

        const session = {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_in: data.expires_in,
          expires_at: expiresAt,
          token_type: data.token_type,
          user: data.user,
        };

        const cookieValue = Buffer.from(JSON.stringify(session)).toString("base64url");

        const redirect = NextResponse.redirect(`${origin}${next}`);
        redirect.cookies.set("sb-" + extractProjectRef() + "-auth-token", cookieValue, {
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
        return redirect;
      }
    } catch {
      return NextResponse.redirect(`${origin}/auth?error=network_error`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_failed`);
}

function extractProjectRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return url.replace("https://", "").split(".")[0];
}
