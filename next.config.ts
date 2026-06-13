import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  sassOptions: {
    // Lets SCSS files `@use "abstracts" as *;` from anywhere.
    loadPaths: [path.join(process.cwd(), "src/styles")],
  },
  images: {
    // TMDb image CDN
    remotePatterns: [{ protocol: "https", hostname: "image.tmdb.org" }],
  },
};

export default nextConfig;
