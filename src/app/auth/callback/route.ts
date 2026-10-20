import { NextResponse } from "next/server";
import { getSupabasePublic } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/mi-cuenta";

  if (code) {
    try {
      const supabase = getSupabasePublic();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // ignore
    }
  }

  // Fallback to destination
  return NextResponse.redirect(`${origin}${next}`);
}
