import { type ValueScore } from "@/lib/pitch";

const VERDICT_STYLE: Record<string, { bg: string; text: string; ring: string }> = {
  "Ship to feed": { bg: "bg-accent-soft", text: "text-accent-deep", ring: "var(--color-accent)" },
  "Tune the offer": { bg: "bg-amber-50", text: "text-amber-700", ring: "#d6a400" },
  Hold: { bg: "bg-rose-50", text: "text-rose-700", ring: "#e0484d" },
};

export default function ValueScoreCard({ value }: { value: ValueScore }) {
  const s = VERDICT_STYLE[value.verdict];
  return (
    <div className="rounded-xl border border-hairline bg-white p-4">
      <div className="flex items-center gap-4">
        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-[20px] font-extrabold text-white"
          style={{ background: s.ring }}
        >
          {value.grade}
        </div>
        <div>
          <p className="text-[14px] font-bold text-ink">Consumer value score · {value.score}</p>
          <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.bg} ${s.text}`}>
            {value.verdict}
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {value.factors.map((f) => (
          <div key={f.label}>
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-medium text-ink-2">{f.label}</span>
              <span className="text-muted">{f.note}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-canvas">
              <div className="h-full rounded-full" style={{ width: `${f.score}%`, background: s.ring }} />
            </div>
          </div>
        ))}
      </div>

      <p className={`mt-3 rounded-lg ${s.bg} px-3 py-2 text-[12px] ${s.text}`}>{value.lever}</p>
      <p className="mt-2 text-[11px] text-muted">
        Only deals scoring ≥ 72 reach the Groupee feed — a StubHub-style value floor, not a coupon dump.
      </p>
    </div>
  );
}
