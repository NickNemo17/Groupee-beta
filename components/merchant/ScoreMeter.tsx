import { type Qualification } from "@/lib/pitch";

export default function ScoreMeter({ qual }: { qual: Qualification }) {
  return (
    <div className="rounded-xl border border-hairline bg-white p-4">
      <div className="flex items-center gap-4">
        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-[20px] font-extrabold text-white"
          style={{ background: qual.score >= 75 ? "var(--color-accent)" : qual.score >= 55 ? "var(--color-score-warm)" : "var(--color-score-cool)" }}
        >
          {qual.score}
        </div>
        <div>
          <p className="text-[14px] font-bold text-ink">Agent fit score</p>
          <p className="text-[12px] text-muted">
            {qual.score >= 75 ? "Strong fit — prioritize outreach." : qual.score >= 55 ? "Worth a personalized pitch." : "Lower priority."}
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {qual.factors.map((f) => (
          <div key={f.label}>
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-medium text-ink-2">{f.label}</span>
              <span className="text-muted">{f.note}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-canvas">
              <div className="h-full rounded-full bg-accent" style={{ width: `${f.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
