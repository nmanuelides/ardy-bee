import type { CapacitorConfig } from "@capacitor/cli";

// Ardy Bee uses Next.js server components, server actions, and auth cookies,
// so it can't be statically exported. The Android shell therefore loads the
// *deployed* web app over the network (the standard pattern for SSR apps).
//
// Set CAP_SERVER_URL to your deployment (e.g. https://ardybee.com) before
// running `npx cap sync`. For testing against the local dev server on a
// physical device, use your machine's LAN IP, e.g. http://192.168.1.50:3000.
const serverUrl = process.env.CAP_SERVER_URL ?? "https://ardybee.app";

const config: CapacitorConfig = {
  appId: "com.ardybee.app",
  appName: "Ardy Bee",
  // Only used as a fallback bundle; the app actually loads server.url.
  webDir: "public",
  server: {
    url: serverUrl,
    // allow http only when pointing at a local dev server
    cleartext: serverUrl.startsWith("http://"),
  },
  backgroundColor: "#13121e",
};

export default config;
