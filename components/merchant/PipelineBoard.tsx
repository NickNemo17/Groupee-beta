"use client";

import { PROSPECTS, STAGES } from "@/lib/merchants";
import { useMerchant } from "@/lib/merchantStore";
import ProspectCard from "./ProspectCard";

export default function PipelineBoard() {
  const { stageOf } = useMerchant();

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const items = PROSPECTS.filter((p) => stageOf(p.id) === stage);
        return (
          <div key={stage} className="flex w-72 shrink-0 flex-col">
            <div className="mb-2 flex items-center justify-between rounded-lg bg-white px-3 py-1.5 shadow-card">
              <h3 className="text-[13px] font-bold text-ink">{stage}</h3>
              <span className="rounded-full bg-canvas px-2 py-0.5 text-[11px] font-semibold text-muted">
                {items.length}
              </span>
            </div>
            <div className="flex flex-col gap-2.5 rounded-xl bg-black/[0.025] p-2">
              {items.map((p) => (
                <ProspectCard key={p.id} prospect={p} />
              ))}
              {items.length === 0 && (
                <p className="px-1 py-6 text-center text-[12px] text-muted">—</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
