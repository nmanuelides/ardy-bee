import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// never cache the OAuth callback
export const dynamic = "force-dynamic";

/**
 * OAuth + email-confirmation callback. Exchanges the auth code for a session,
 * then redirects into the app.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const providerError =
    searchParams.get("error_description") ?? searchParams.get("error");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    // surface the real reason so it's debuggable
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(providerError ?? "No auth code returned")}`,
  );
}
