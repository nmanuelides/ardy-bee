"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const qs = new URLSearchParams({ error: error.message, email });
    redirect(`/login?${qs}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });

  if (error) {
    const qs = new URLSearchParams({ error: error.message, email, display_name: displayName });
    redirect(`/signup?${qs}`);
  }

  // Email confirmation disabled → signUp returns a live session: the user is
  // already signed in, so send them straight into the app.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  // Anti-enumeration: when the address is already registered, Supabase returns
  // success with NO error and NO email sent, flagging it with empty identities.
  // Surface that instead of a misleading "check your email".
  if (data.user && data.user.identities?.length === 0) {
    const qs = new URLSearchParams({
      error: "An account with this email already exists. Try signing in instead.",
      email,
    });
    redirect(`/login?${qs}`);
  }

  // Genuinely new account with confirmation on → the email is on its way.
  redirect(
    `/login?message=${encodeURIComponent("Check your email to confirm your account.")}`,
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
