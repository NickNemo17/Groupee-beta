import { type ValueTier } from "@/lib/value";

const STYLE: Record<ValueTier, string> = {
  "Great value": "bg-accent text-white",
  "Good value": "bg-accent-soft text-accent-deep",
  "Fair value": "bg-white/95 text-ink",
};

// StubHub-style value chip. `solid` for the card overlay, plain for inline use.
export default function ValueBadge({ tier, className = "" }: { tier: ValueTier; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-card ${STYLE[tier]} ${className}`}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2l2.6 6.3L21 9l-5 4.3L17.5 20 12 16.6 6.5 20 8 13.3 3 9l6.4-.7L12 2z" />
      </svg>
      {tier}
    </span>
  );
}
