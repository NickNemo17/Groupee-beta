import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // react-leaflet does not survive Strict Mode's mount/unmount/remount cleanly
  // (the Leaflet map instance ends up with a corrupted internal size). Off.
  reactStrictMode: false,
};

export default nextConfig;

// Cloudflare Workers (OpenNext) — enables CF bindings during local `next dev`.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
