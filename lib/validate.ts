// Tiny input guards for the API routes — cap externally-controlled strings
// before they reach a paid API (cost-abuse + prompt-injection hygiene).

export function cappedString(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (s.length === 0 || s.length > max) return null;
  return s;
}
