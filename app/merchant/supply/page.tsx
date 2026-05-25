import Link from "next/link";
import { PROSPECTS, SUPPLY_STATS } from "@/lib/merchants";
import { ARCHETYPES, archetypeFor, type Archetype } from "@/lib/archetypes";
import DiscoverPanel from "@/components/merchant/DiscoverPanel";

export const metadata = { title: "Groupee Partner Studio — Supply graph" };

const MECH_STYLE: Record<string, string> = {
  A: "bg-blue-50 text-blue-700",
  B: "bg-violet-50 text-violet-700",
  C: "bg-accent-soft text-accent-dark",
};

export default function SupplyGraphPage() {
  // group prospects by archetype, in the canonical archetype order
  const order = Object.keys(ARCHETYPES) as Archetype[];
  const groups = order
    .map((key) => ({
      arc: ARCHETYPES[key],
      items: PROSPECTS.filter((p) => archetypeFor(p.category).key === key),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="px-6 py-6 lg:px-8">
      <header className="mb-5">
        <h1 className="text-[24px] font-extrabold tracking-tight text-ink">Supply graph</h1>
        <p className="max-w-2xl text-[13px] text-muted">
          A continuously refreshed map of every local merchant with a structured deal — agents traverse
          Google Business, Yelp, Instagram/TikTok, menu PDFs, OpenTable/Resy, sites, and Reddit.
          {" "}{SUPPLY_STATS.tracked} tracked in Santa Barbara, refreshed nightly. Grouped by vertical archetype —
          the offer mechanic the agent will use.
        </p>
      </header>

      <DiscoverPanel />

      <div className="space-y-7">
        {groups.map(({ arc, items }) => (
          <section key={arc.key}>
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-[16px] font-bold capitalize text-ink">{arc.key}</h2>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${MECH_STYLE[arc.mechanic]}`}>
                Mechanic {arc.mechanic} · {arc.mechanicName}
              </span>
              <span className="text-[12px] text-muted">{items.length} · sells the {arc.unit}</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-hairline bg-white">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-canvas text-[11px] uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Merchant</th>
                    <th className="px-4 py-2 font-semibold">Slow window</th>
                    <th className="px-4 py-2 font-semibold">Off-peak</th>
                    <th className="hidden px-4 py-2 font-semibold lg:table-cell">Top signal</th>
                    <th className="px-4 py-2 font-semibold">Refreshed</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id} className="border-t border-hairline hover:bg-canvas/60">
                      <td className="px-4 py-2.5">
                        <Link href={`/merchant/${p.id}`} className="font-semibold text-ink hover:text-accent-dark">
                          {p.name}
                        </Link>
                        <div className="text-[11px] text-muted">{p.category} · {p.neighborhood}</div>
                      </td>
                      <td className="px-4 py-2.5 text-ink-2">{p.offPeakWindow}</td>
                      <td className="px-4 py-2.5">
                        <span className="rounded-full bg-canvas px-2 py-0.5 text-[12px] font-medium text-ink-2">
                          {p.offPeakUtilizationPct}% full
                        </span>
                      </td>
                      <td className="hidden max-w-xs px-4 py-2.5 text-[12px] text-muted lg:table-cell">“{p.signals[0]}”</td>
                      <td className="px-4 py-2.5 text-[11px] text-muted">{p.lastRefresh}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
