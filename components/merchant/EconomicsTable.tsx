import { type Economics } from "@/lib/pitch";

const usd = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const usd2 = (n: number) => `$${n.toFixed(2)}`;

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between py-1.5">
      <dt className="text-muted">{k}</dt>
      <dd className={strong ? "font-bold text-accent-dark" : "font-medium text-ink"}>{v}</dd>
    </div>
  );
}

function KeepCard({ label, val, good, note }: { label: string; val: string; good?: boolean; note: string }) {
  return (
    <div className={`rounded-lg border p-2.5 text-center ${good ? "border-accent bg-accent-soft" : "border-hairline"}`}>
      <p className="text-[11px] font-medium text-muted">{label}</p>
      <p className={`text-[18px] font-extrabold ${good ? "text-accent-dark" : "text-ink"}`}>{val}</p>
      <p className="text-[11px] text-muted">{note}</p>
    </div>
  );
}

export default function EconomicsTable({ e }: { e: Economics }) {
  // Mechanic B — access / value-add (no public discount)
  if (e.mechanic === "B") {
    return (
      <div className="rounded-xl border border-hairline bg-white p-4">
        <h3 className="text-[14px] font-bold text-ink">The math — access, not a discount</h3>
        <p className="text-[12px] text-muted">Your door stays exclusive. We fill slow nights with value-add, not a public markdown.</p>
        <dl className="mt-3 divide-y divide-hairline text-[13px]">
          <Row k="Full price (unchanged)" v={usd2(e.regularPrice)} />
          <Row k="Value-add" v={e.access?.comp ?? "—"} />
          <Row k={`Comp cost to you`} v={`~${usd2(e.access?.compCost ?? 0)}`} />
          <Row k={`You keep / ${e.unitLabel}`} v={`~${usd2(e.access?.keepFull ?? 0)} (after ${e.groupeeCommissionPct}%)`} strong />
          <Row k="Incremental profit on empty nights" v={`~${usd(e.monthlyIncrementalProfit)}/mo`} strong />
        </dl>
        <p className="mt-2 text-[11px] text-muted">Groupon would force a public discount that cheapens the venue. We don&apos;t. + you keep every guest&apos;s contact.</p>
        <p className="mt-1 text-[10px] italic text-muted">Comp value is a modeled estimate; merchant COGS is typically lower.</p>
      </div>
    );
  }

  // Mechanic C — intro → regular (LTV is the number)
  if (e.mechanic === "C" && e.intro) {
    return (
      <div className="rounded-xl border border-hairline bg-white p-4">
        <h3 className="text-[14px] font-bold text-ink">The math — win the rebook, not the coupon</h3>
        <p className="text-[12px] text-muted">A generous intro fills dead {e.unitLabel}s; the real value is the standing client.</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <KeepCard label="Lifetime value" val={usd(e.intro.ltv)} good note="Groupee (you keep the client)" />
          <KeepCard label="One-off only" val={usd2(e.grouponKeepPerCustomer)} note="Groupon coupon-hunter" />
          <KeepCard label="Empty chair" val="$0.00" note="status quo" />
        </div>
        <dl className="mt-3 divide-y divide-hairline text-[13px]">
          <Row k="Regular price" v={usd2(e.regularPrice)} />
          <Row k={`Intro ${e.unitLabel} (−${e.discountPct}%)`} v={usd2(e.intro.introPrice)} />
          <Row k="Commission" v={`${e.groupeeCommissionPct}% (Groupon ~${e.grouponCommissionPct}%)`} />
          <Row k="Redemption cap" v={`${e.redemptionCapPerDay}/day, off-peak only`} />
          <Row k="Est. lifetime value / client" v={`~${usd(e.intro.ltv)}`} strong />
        </dl>
        <p className="mt-2 text-[11px] text-muted">You keep the client&apos;s contact — the opposite of a Groupon facial. Fixes the rebook problem.</p>
        <p className="mt-1 text-[10px] italic text-muted">LTV is a modeled estimate (intro→repeat benchmark) — validated per partner in pilot.</p>
      </div>
    );
  }

  // Mechanic A — off-peak % fill (default)
  return (
    <div className="rounded-xl border border-hairline bg-white p-4">
      <h3 className="text-[14px] font-bold text-ink">The math, in the open — “make it even”</h3>
      <p className="text-[12px] text-muted">
        {e.discountPct}% off, capped at {e.redemptionCapPerDay}/day so it fills off-peak without touching your peak.
        {e.groupUnit ? ` Sold as a ${e.unitLabel} (group of ${e.groupUnit}).` : ""}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <KeepCard label={`You keep / ${e.unitLabel}`} val={usd2(e.groupeeKeepPerCustomer)} good note={`Groupee · ${e.groupeeCommissionPct}% fee`} />
        <KeepCard label={`You keep / ${e.unitLabel}`} val={usd2(e.grouponKeepPerCustomer)} note={`Groupon · ~${e.grouponCommissionPct}% fee`} />
        <KeepCard label="Empty seat" val="$0.00" note="status quo" />
      </div>
      <dl className="mt-3 divide-y divide-hairline text-[13px]">
        <Row k="Regular price" v={usd2(e.regularPrice)} />
        <Row k={`Deal price (−${e.discountPct}%)`} v={usd2(e.dealPrice)} />
        <Row k="Redemption cap" v={`${e.redemptionCapPerDay}/day`} />
        <Row k="Est. incremental covers" v={`~${e.estMonthlyCovers}/mo`} />
        <Row k="Incremental profit on empty seats" v={`~${usd(e.monthlyIncrementalProfit)}/mo`} strong />
        <Row k="Revenue you keep" v={`~${usd(e.monthlyKeep)}/mo · ${usd(e.annualKeep)}/yr`} strong />
      </dl>
      <p className="mt-2 text-[11px] text-muted">+ every guest&apos;s contact info stays yours — repeat regulars, not one-and-done coupon hunters.</p>
    </div>
  );
}
