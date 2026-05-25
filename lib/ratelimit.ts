// Demo-grade in-memory rate limiter (per IP + bucket). Not for multi-instance
// production — a real deployment would use Redis/Upstash. Good enough to stop a
// single client from hammering the paid APIs locally.

type Hit = { count: number; resetAt: number };
const buckets = new Map<string, Hit>();

export function rateLimit(
  req: Request,
  bucket: string,
  limit = 20,
  windowMs = 60_000
): boolean {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const hit = buckets.get(key);

  if (!hit || now > hit.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (hit.count >= limit) return false;
  hit.count += 1;
  return true;
}
