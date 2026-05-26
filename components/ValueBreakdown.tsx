import { type ExperienceValue } from "@/lib/value";

// Shows how the value score is determined. `compact` is used inside the
// hover popover; the full version is a card on the detail page.
export default function ValueBreakdown({
  value,
  compact = false,
  className = "",
}: {
  value: ExperienceValue;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`${compact ? "" : "rounded-card border border-hairline bg-white p-4"} ${className}`}
    >
      <div className="flex items-center justify-between">
        <p className={`font-bold text-ink ${compact ? "text-[13px]" : "text-[15px]"}`}>
          {value.tier}
        </p>
        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent-deep">
          {value.score}/100
        </span>
      </div>
      <p className={`mt-0.5 text-muted ${compact ? "text-[11px]" : "text-[12px]"}`}>{value.reason}</p>

      <div className={`mt-2.5 space-y-2 ${compact ? "" : "mt-3"}`}>
        {value.factors.map((f) => (
          <div key={f.label}>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-ink-2">{f.label}</span>
              <span className="truncate pl-2 text-right text-muted">{f.note}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-canvas">
              <div className="h-full rounded-full bg-accent" style={{ width: `${f.score}%` }} />
            </div>
          </div>
        ))}
      </div>

      {!compact && (
        <p className="mt-3 text-[11px] text-muted">
          Value is scored on quality, local demand, a fair price <em>for its category</em>, and honest
          all-in pricing — never on discount depth. A premium experience can still be great value.
        </p>
      )}
    </div>
  );
}
