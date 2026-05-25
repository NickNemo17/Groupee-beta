"use client";

import Link from "next/link";
import { type Prospect } from "@/lib/merchants";
import { qualify } from "@/lib/pitch";

export default function ProspectCard({ prospect }: { prospect: Prospect }) {
  const { score } = qualify(prospect);
  return (
    <Link
      href={`/merchant/${prospect.id}`}
      className="block rounded-xl border border-hairline bg-white p-3 shadow-card transition hover:border-accent/40 hover:shadow-pop"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[14px] font-semibold leading-tight text-ink">{prospect.name}</p>
        <span
          className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-white"
          style={{ background: score >= 75 ? "var(--color-accent)" : score >= 55 ? "#d6a400" : "#9aa0a6" }}
          title="Agent fit score"
        >
          {score}
        </span>
      </div>
      <p className="mt-0.5 text-[12px] text-muted">
        {prospect.category} · {prospect.neighborhood}
      </p>
      <p className="mt-2 line-clamp-2 text-[12px] leading-snug text-ink-2">“{prospect.signals[0]}”</p>
      <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
        <span>★ {prospect.rating}</span>
        <span>·</span>
        <span>{prospect.offPeakUtilizationPct}% full {prospect.offPeakWindow.split(",")[0]}</span>
      </div>
    </Link>
  );
}
