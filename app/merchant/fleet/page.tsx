"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PROSPECTS } from "@/lib/merchants";
import { computeEconomics, qualify, valueScore, type Verdict } from "@/lib/pitch";
import { archetypeFor } from "@/lib/archetypes";
import { useMerchant } from "@/lib/merchantStore";

const VERDICT_PILL: Record<Verdict, string> = {
  "Ship to feed": "bg-accent-soft text-accent-deep",
  "Tune the offer": "bg-amber-50 text-amber-700",
  Hold: "bg-rose-50 text-rose-700",
};

export default function FleetPage() {
  const { stageOf, setStage } = useMerchant();

  const rows = useMemo(
    () =>
      PROSPECTS.map((p) => {
        const econ = computeEconomics(p);
        return {
          p,
          arc: archetypeFor(p.category),
          fit: qualify(p).score,
          value: valueScore(p, econ),
        };
      }).sort((a, b) => b.value.score - a.value.score),
    []
  );

  const shipReady = rows.filter(
    (r) => r.value.verdict === "Ship to feed" && ["Discovered", "Qualified"].includes(stageOf(r.p.id))
  );
  const passRate = Math.round((rows.filter((r) => r.value.verdict !== "Hold").length / rows.length) * 100);

  return (
    <div className="px-6 py-6 lg:px-8">
      <header className="mb-4">
        <h1 className="text-[24px] font-extrabold tracking-tight text-ink">Agent fleet</h1>
        <p className="text-[13px] text-muted">
          The agent drafts and scores every prospect in parallel — ~10,000 substantively personalized
          outreaches/week vs ~100 for one human BDR. Humans approve; the value floor filters.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-ink shadow-card">
          {rows.length} prospects scored
        </span>
        <span className="rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-accent-dark shadow-card">
          {passRate}% clear the value floor
        </span>
        <button
          disabled={shipReady.length === 0}
          onClick={() => shipReady.forEach((r) => setStage(r.p.id, "Proposal sent"))}
          className="rounded-btn bg-accent px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-40"
        >
          Approve all Ship-grade ({shipReady.length}) →
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-hairline bg-white">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-canvas text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Merchant</th>
              <th className="px-4 py-2.5 font-semibold">Mechanic</th>
              <th className="px-4 py-2.5 font-semibold">Fit</th>
              <th className="px-4 py-2.5 font-semibold">Value</th>
              <th className="px-4 py-2.5 font-semibold">Verdict</th>
              <th className="px-4 py-2.5 font-semibold">Stage</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, arc, fit, value }) => (
              <tr key={p.id} className="border-t border-hairline hover:bg-canvas/60">
                <td className="px-4 py-2.5">
                  <Link href={`/merchant/${p.id}`} className="font-semibold text-ink hover:text-accent-dark">
                    {p.name}
                  </Link>
                  <div className="text-[11px] text-muted">{p.category} · {p.neighborhood}</div>
                </td>
                <td className="px-4 py-2.5 text-[12px] text-ink-2">{arc.mechanic} · {arc.label}</td>
                <td className="px-4 py-2.5 font-medium text-ink">{fit}</td>
                <td className="px-4 py-2.5 font-bold text-ink">{value.score}</td>
                <td className="px-4 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${VERDICT_PILL[value.verdict]}`}>
                    {value.verdict}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-[12px] text-muted">{stageOf(p.id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
