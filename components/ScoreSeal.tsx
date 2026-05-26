import { type ExperienceValue } from "@/lib/value";
import ValueBreakdown from "./ValueBreakdown";

// The signature device: a value "seal" — big mono score / 100 + tier, ringed by
// tier color (magenta for the #1 ranked pick). Hover/focus reveals the breakdown.
const SIZES = {
  sm: { box: "px-2 py-1", num: "text-[15px]", tier: "text-[9px]" },
  md: { box: "px-2.5 py-1.5", num: "text-[22px]", tier: "text-[10px]" },
  lg: { box: "px-4 py-2.5", num: "text-[34px]", tier: "text-[12px]" },
} as const;

export default function ScoreSeal({
  value,
  size = "md",
  top = false,
  showBreakdown = false,
  className = "",
}: {
  value: ExperienceValue;
  size?: keyof typeof SIZES;
  top?: boolean;
  showBreakdown?: boolean;
  className?: string;
}) {
  const ring = top
    ? "var(--color-top)"
    : value.tier === "Great value"
      ? "var(--color-accent)"
      : value.tier === "Good value"
        ? "var(--color-accent-dark)"
        : "var(--color-score-cool)";
  const s = SIZES[size];

  const seal = (
    <span
      className={`inline-flex flex-col items-center rounded-xl border-2 bg-white text-center leading-none ${s.box}`}
      style={{ borderColor: ring }}
    >
      <span className="font-mono font-bold tabular-nums text-ink">
        <span className={s.num}>{value.score}</span>
        <span className="text-[10px] font-medium text-muted"> /100</span>
      </span>
      <span className={`mt-0.5 font-mono font-semibold uppercase tracking-wide ${s.tier}`} style={{ color: ring }}>
        {top ? "Top value" : value.tier.replace(" value", "")}
      </span>
    </span>
  );

  if (!showBreakdown) return <span className={className}>{seal}</span>;

  return (
    <span
      className={`group/seal relative inline-block ${className}`}
      tabIndex={0}
      aria-label={`Value ${value.score} of 100 — how it's scored`}
    >
      {seal}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-50 mt-1.5 hidden w-60 rounded-card border border-hairline bg-white p-3 text-left shadow-pop group-hover/seal:block group-focus-within/seal:block"
      >
        <ValueBreakdown value={value} compact />
      </span>
    </span>
  );
}
