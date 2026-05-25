"use client";

import { useMemo } from "react";
import { PROSPECTS, STAGES, type Stage } from "@/lib/merchants";
import { computeEconomics, valueScore } from "@/lib/pitch";
import { archetypeFor } from "@/lib/archetypes";
import { useMerchant } from "@/lib/merchantStore";

const usd = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-white px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="text-[24px] font-extrabold leading-tight text-ink">{value}</p>
      {sub && <p className="text-[11px] text-accent-dark">{sub}</p>}
    </div>
  );
}

function Bars({ data }: { data: { label: string; n: number; color?: string }[] }) {
  const max = Math.max(1, ...data.map((d) => d.n));
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-[12px] text-ink-2">{d.label}</span>
          <div className="h-4 flex-1 overflow-hidden rounded bg-canvas">
            <div className="h-full rounded" style={{ width: `${(d.n / max) * 100}%`, background: d.color ?? "var(--color-accent)" }} />
          </div>
          <span className="w-8 text-right text-[12px] font-semibold text-ink">{d.n}</span>
        </div>
      ))}
    </div>
  );
}

export default function ImpactPage() {
  const { stageOf } = useMerchant();

  const m = useMemo(() => {
    const scored = PROSPECTS.map((p) => {
      const econ = computeEconomics(p);
      return { p, econ, value: valueScore(p, econ), arc: archetypeFor(p.category) };
    });
    const funnel = STAGES.map((s) => ({ label: s, n: PROSPECTS.filter((p) => stageOf(p.id) === s).length }));
    const passRate = Math.round((scored.filter((s) => s.value.verdict !== "Hold").length / scored.length) * 100);
    const tierMix = (["Ship to feed", "Tune the offer", "Hold"] as const).map((v, i) => ({
      label: v,
      n: scored.filter((s) => s.value.verdict === v).length,
      color: ["var(--color-accent)", "#d6a400", "#e0484d"][i],
    }));
    const mechMix = (["A", "B", "C"] as const).map((mech) => ({
      label: `Mechanic ${mech}`,
      n: scored.filter((s) => s.arc.mechanic === mech).length,
    }));
    const onboarded = PROSPECTS.filter((p) => stageOf(p.id) === "Onboarded");
    const pipelineProfit = scored.reduce((sum, s) => sum + s.econ.monthlyIncrementalProfit, 0);
    const liveProfit = onboarded.reduce((sum, p) => sum + computeEconomics(p).monthlyIncrementalProfit, 0);
    return { funnel, passRate, tierMix, mechMix, onboarded: onboarded.length, pipelineProfit, liveProfit };
  }, [stageOf]);

  return (
    <div className="px-6 py-6 lg:px-8">
      <header className="mb-5">
        <h1 className="text-[24px] font-extrabold tracking-tight text-ink">Impact</h1>
        <p className="text-[13px] text-muted">
          The AI-attributable KPIs the board letter asks for — observable, not asserted.
        </p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Live on feed" value={String(m.onboarded)} sub="merchants onboarded" />
        <Stat label="Value-pass rate" value={`${m.passRate}%`} sub="clear the ≥72 floor" />
        <Stat label="Merchant profit / mo (live)" value={usd(m.liveProfit)} sub="incremental, onboarded" />
        <Stat label="Pipeline profit / mo (potential)" value={usd(m.pipelineProfit)} sub="if full pipeline ships" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-hairline bg-white p-4">
          <h2 className="mb-3 text-[14px] font-bold text-ink">Pipeline funnel</h2>
          <Bars data={m.funnel.map((f) => ({ label: f.label, n: f.n }))} />
        </div>
        <div className="rounded-xl border border-hairline bg-white p-4">
          <h2 className="mb-3 text-[14px] font-bold text-ink">Value verdict mix</h2>
          <Bars data={m.tierMix} />
          <p className="mt-3 text-[11px] text-muted">Only “Ship to feed” reaches consumers — the curated-value floor.</p>
        </div>
        <div className="rounded-xl border border-hairline bg-white p-4">
          <h2 className="mb-3 text-[14px] font-bold text-ink">Offer mechanic mix</h2>
          <Bars data={m.mechMix} />
          <p className="mt-3 text-[11px] text-muted">A = off-peak fill · B = access · C = intro→regular.</p>
        </div>
      </div>

      <p className="mt-5 text-[11px] italic text-muted">
        Profit figures are modeled from per-merchant economics (margin, off-peak capacity, redemption
        caps) — directional estimates to validate per partner in pilot, not booked revenue.
      </p>
    </div>
  );
}
