import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const ref = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace("https://", "").split(".")[0];
  const response = NextResponse.json({ ok: true });
  response.cookies.set("sb-" + ref + "-auth-token", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
  });
  return response;
}
