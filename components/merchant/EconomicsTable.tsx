import { type Economics } from "@/lib/pitch";

const usd = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const usd2 = (n: number) => `$${n.toFixed(2)}`;

export default function EconomicsTable({ e }: { e: Economics }) {
  return (
    <div className="rounded-xl border border-hairline bg-white p-4">
      <h3 className="text-[14px] font-bold text-ink">The math, in the open — “make it even”</h3>
      <p className="text-[12px] text-muted">
        {e.discountPct}% off, capped at {e.redemptionCapPerDay}/day so it fills off-peak without touching your peak.
      </p>

      {/* You-keep comparison */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { label: "Groupee", val: usd2(e.groupeeKeepPerCustomer), good: true, note: `${e.groupeeCommissionPct}% fee` },
          { label: "Groupon", val: usd2(e.grouponKeepPerCustomer), good: false, note: `~${e.grouponCommissionPct}% fee` },
          { label: "Empty seat", val: "$0.00", good: false, note: "status quo" },
        ].map((c) => (
          <div
            key={c.label}
            className={`rounded-lg border p-2.5 text-center ${c.good ? "border-accent bg-accent-soft" : "border-hairline"}`}
          >
            <p className="text-[11px] font-medium text-muted">You keep / guest</p>
            <p className={`text-[18px] font-extrabold ${c.good ? "text-accent-dark" : "text-ink"}`}>{c.val}</p>
            <p className="text-[11px] text-muted">{c.label} · {c.note}</p>
          </div>
        ))}
      </div>

      <dl className="mt-3 divide-y divide-hairline text-[13px]">
        <Row k="Regular price" v={usd2(e.regularPrice)} />
        <Row k={`Deal price (−${e.discountPct}%)`} v={usd2(e.dealPrice)} />
        <Row k="Redemption cap" v={`${e.redemptionCapPerDay}/day`} />
        <Row k="Est. incremental covers" v={`~${e.estMonthlyCovers}/mo`} />
        <Row k="Incremental profit on empty seats" v={`~${usd(e.monthlyIncrementalProfit)}/mo`} strong />
        <Row k="Revenue you keep" v={`~${usd(e.monthlyKeep)}/mo · ${usd(e.annualKeep)}/yr`} strong />
      </dl>
      <p className="mt-2 text-[11px] text-muted">
        + every guest&apos;s contact info stays yours, so they become repeat regulars — not one-and-done coupon hunters.
      </p>
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between py-1.5">
      <dt className="text-muted">{k}</dt>
      <dd className={strong ? "font-bold text-accent-dark" : "font-medium text-ink"}>{v}</dd>
    </div>
  );
}
