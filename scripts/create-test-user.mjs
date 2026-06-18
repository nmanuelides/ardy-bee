// Create (or confirm) a pre-verified Supabase user for local testing — no
// confirmation email required. Uses the service-role key, so it bypasses the
// email flow entirely.
//
// Usage:
//   node scripts/create-test-user.mjs <email> <password> [displayName]
//   node scripts/create-test-user.mjs                      # uses defaults below
//
// Requires in .env.local:
//   NEXT_PUBLIC_SUPABASE_URL=...
//   SUPABASE_SERVICE_ROLE_KEY=...   (Supabase → Project Settings → API → service_role)

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// --- minimal .env.local parser (no extra deps) ---
function loadEnv(path = ".env.local") {
  const out = {};
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return out;
  }
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    out[t.slice(0, eq).trim()] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
  );
  process.exit(1);
}

const email = process.argv[2] || "test@ardybee.local";
const password = process.argv[3] || "password123";
const displayName = process.argv[4] || "Test User";

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true, // <-- skips the confirmation email
  user_metadata: { display_name: displayName },
});

if (error) {
  // If it already exists, confirm it instead so you can log in.
  if (/already.*registered|already.*exists/i.test(error.message)) {
    const { data: list } = await supabase.auth.admin.listUsers();
    const existing = list?.users?.find((u) => u.email === email);
    if (existing) {
      await supabase.auth.admin.updateUserById(existing.id, { email_confirm: true });
      console.log(`✓ Existing user "${email}" confirmed. Log in with your password.`);
      process.exit(0);
    }
  }
  console.error("Failed:", error.message);
  process.exit(1);
}

console.log(`✓ Created confirmed user:\n  email:    ${email}\n  password: ${password}`);
console.log(`  id:       ${data.user?.id}`);
console.log("Log in at /login with the email + password above.");
