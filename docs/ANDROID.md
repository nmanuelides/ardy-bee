# Ardy Bee — Android (Capacitor)

Ardy Bee is a Next.js app that uses server components, server actions, and
auth cookies, so it **can't be statically exported**. The Android app is a
thin Capacitor shell that loads the **deployed web app** over the network.
This is the standard, supported pattern for server-rendered apps.

## One-time prerequisites

- **Android Studio** (includes the Android SDK + an emulator)
- **JDK 17** (bundled with recent Android Studio)
- A **deployed** Ardy Bee instance (e.g. Vercel) — the app loads this URL

## First-time setup

1. Point Capacitor at your deployment:
   ```bash
   # PowerShell:  $env:CAP_SERVER_URL = "https://your-deployment.com"
   # bash:        export CAP_SERVER_URL="https://your-deployment.com"
   ```
   (Defaults to `https://ardybee.app` — see `capacitor.config.ts`.)

2. Generate the native Android project (creates `android/`):
   ```bash
   npm run cap:add-android
   ```

3. Sync config + open in Android Studio:
   ```bash
   npm run cap:sync
   npm run cap:android
   ```

4. In Android Studio, pick a device/emulator and **Run**, or
   **Build → Build APK(s)** to produce an installable APK.

## Testing against the local dev server

To run the shell against `npm run dev` on a physical device on your LAN:

1. Find your machine's LAN IP (e.g. `192.168.1.50`).
2. `export CAP_SERVER_URL="http://192.168.1.50:3000"` (cleartext is auto-enabled
   for `http://` URLs in `capacitor.config.ts`).
3. `npm run dev`, then `npm run cap:sync` and run from Android Studio.

## Auth note

Google OAuth redirects must include the deployed origin in Supabase
(Authentication → URL Configuration → Redirect URLs) and in the Google Cloud
OAuth client. For deep-link return into the app, add the app's custom scheme
later if you move auth fully native.

## Updating the app

Because the shell loads the live site, **most updates ship by redeploying the
web app** — no new APK needed. Rebuild/republish the APK only when native
config (icons, splash, plugins, server URL) changes.
