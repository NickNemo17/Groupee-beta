import { type ValueTier, type ExperienceValue } from "@/lib/value";
import ValueBreakdown from "./ValueBreakdown";

const STYLE: Record<ValueTier, string> = {
  "Great value": "bg-accent text-white",
  "Good value": "bg-accent-soft text-accent-deep",
  "Fair value": "bg-white/95 text-ink",
};

// StubHub-style value chip. Pass `value` to enable the hover/focus breakdown
// (how the score is determined).
export default function ValueBadge({
  tier,
  value,
  className = "",
}: {
  tier: ValueTier;
  value?: ExperienceValue;
  className?: string;
}) {
  const pill = (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-card ${STYLE[tier]}`}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2l2.6 6.3L21 9l-5 4.3L17.5 20 12 16.6 6.5 20 8 13.3 3 9l6.4-.7L12 2z" />
      </svg>
      {tier}
    </span>
  );

  if (!value) return <span className={className}>{pill}</span>;

  return (
    <span
      className={`group/val relative inline-block ${className}`}
      tabIndex={0}
      aria-label={`${tier} — how it's scored`}
    >
      {pill}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-50 mt-1.5 hidden w-60 rounded-card border border-hairline bg-white p-3 text-left shadow-pop group-hover/val:block group-focus-within/val:block"
      >
        <ValueBreakdown value={value} compact />
      </span>
    </span>
  );
}
