import Link from "next/link";
import { PROSPECTS, SUPPLY_STATS } from "@/lib/merchants";

export const metadata = { title: "Groupee Partner Studio — Supply graph" };

export default function SupplyGraphPage() {
  return (
    <div className="px-6 py-6 lg:px-8">
      <header className="mb-5">
        <h1 className="text-[24px] font-extrabold tracking-tight text-ink">Supply graph</h1>
        <p className="max-w-2xl text-[13px] text-muted">
          A continuously refreshed map of every local merchant with a structured deal — assembled by
          agents traversing Google Business Profiles, Yelp, Instagram/TikTok, menu PDFs, OpenTable/Resy,
          merchant sites, and Reddit local-deals threads. {SUPPLY_STATS.tracked} merchants tracked in
          Santa Barbara, refreshed nightly at marginal cost.
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-hairline bg-white">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-canvas text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Merchant</th>
              <th className="px-4 py-2.5 font-semibold">Slow window</th>
              <th className="px-4 py-2.5 font-semibold">Off-peak</th>
              <th className="hidden px-4 py-2.5 font-semibold lg:table-cell">Top signal</th>
              <th className="px-4 py-2.5 font-semibold">Sources</th>
              <th className="px-4 py-2.5 font-semibold">Refreshed</th>
            </tr>
          </thead>
          <tbody>
            {PROSPECTS.map((p) => (
              <tr key={p.id} className="border-t border-hairline hover:bg-canvas/60">
                <td className="px-4 py-3">
                  <Link href={`/merchant/${p.id}`} className="font-semibold text-ink hover:text-accent-dark">
                    {p.name}
                  </Link>
                  <div className="text-[11px] text-muted">{p.category} · {p.neighborhood}</div>
                </td>
                <td className="px-4 py-3 text-ink-2">{p.offPeakWindow}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-canvas px-2 py-0.5 text-[12px] font-medium text-ink-2">
                    {p.offPeakUtilizationPct}% full
                  </span>
                </td>
                <td className="hidden max-w-xs px-4 py-3 text-[12px] text-muted lg:table-cell">
                  “{p.signals[0]}”
                </td>
                <td className="px-4 py-3 text-[11px] text-muted">{p.sources.length} · {p.sources.slice(0, 2).join(", ")}…</td>
                <td className="px-4 py-3 text-[11px] text-muted">{p.lastRefresh}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
