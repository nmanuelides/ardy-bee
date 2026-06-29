"use client";

import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { useT } from "@/lib/i18n/provider";

/** Kicks off Google OAuth. Requires the Google provider to be enabled in
 *  the Supabase dashboard (Authentication → Providers → Google). */
export default function GoogleButton() {
  const t = useT();
  async function handleClick() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <Button variant="neumorphic" type="button" onClick={handleClick}>
      {t.auth.google}
    </Button>
  );
}
