import { cookies } from "next/headers";

function extractProjectRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return url.replace("https://", "").split(".")[0];
}

function decodeBase64Url(str: string) {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
}

export type SupabaseUser = {
  id: string;
  email: string | null;
} | null;

export async function getServerUser(): Promise<SupabaseUser> {
  try {
    const cookieStore = await cookies();
    const cookieName = "sb-" + extractProjectRef() + "-auth-token";
    const cookie = cookieStore.get(cookieName);
    if (!cookie?.value) return null;

    const session = JSON.parse(Buffer.from(cookie.value, "base64url").toString("utf-8"));
    if (!session.access_token) return null;

    const payload = session.access_token.split(".")[1];
    if (!payload) return null;

    const decoded = decodeBase64Url(payload);
    return { id: decoded.sub, email: decoded.email ?? null };
  } catch {
    return null;
  }
}
