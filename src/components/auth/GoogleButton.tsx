"use client";

import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

/** Kicks off Google OAuth. Requires the Google provider to be enabled in
 *  the Supabase dashboard (Authentication → Providers → Google). */
export default function GoogleButton() {
  async function handleClick() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <Button variant="neumorphic" type="button" onClick={handleClick}>
      Continue with Google
    </Button>
  );
}
