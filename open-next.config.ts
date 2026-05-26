import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Default config: server-rendered Next.js on a Cloudflare Worker.
// No incremental cache configured — the app's data is static/mock, so we
// don't need R2/KV-backed ISR for the beta.
export default defineCloudflareConfig({});
