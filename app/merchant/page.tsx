import { SUPPLY_STATS } from "@/lib/merchants";
import PipelineBoard from "@/components/merchant/PipelineBoard";

export const metadata = { title: "Groupee Partner Studio — Pipeline" };

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-white px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="text-[22px] font-extrabold leading-tight text-ink">{value}</p>
      {sub && <p className="text-[11px] text-accent-dark">{sub}</p>}
    </div>
  );
}

export default function PipelinePage() {
  return (
    <div className="px-6 py-6 lg:px-8">
      <header className="mb-5">
        <h1 className="text-[24px] font-extrabold tracking-tight text-ink">Merchant pipeline</h1>
        <p className="text-[13px] text-muted">
          Santa Barbara · the agent fleet sources, qualifies, and pitches local supply — fairly.
        </p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Merchants tracked" value={SUPPLY_STATS.tracked.toString()} sub="refreshed nightly" />
        <Stat label="Sources traversed" value={`${SUPPLY_STATS.sources}`} sub="Google · Yelp · IG · menus · Resy · Reddit" />
        <Stat label="Outreach / week" value="~10,000" sub="vs ~100 for one human BDR" />
        <Stat label="Cost / contact" value="cents" sub="substantively personalized" />
      </div>

      <PipelineBoard />
    </div>
  );
}
