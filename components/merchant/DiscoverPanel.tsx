"use client";

import { useState } from "react";
import { type DiscoveredMerchant } from "@/app/api/discover/route";

export default function DiscoverPanel() {
  const [q, setQ] = useState("yoga studios");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [results, setResults] = useState<DiscoveredMerchant[]>([]);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/discover?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { source: string; merchants: DiscoveredMerchant[] };
      setSource(data.source);
      setResults(data.merchants);
    } catch {
      setSource("mock");
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <div className="mb-6 rounded-xl border border-hairline bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-bold text-ink">Discover live merchants</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          className="min-w-0 flex-1 rounded-lg border border-hairline px-3 py-1.5 text-[13px] outline-none focus:border-accent"
          placeholder="e.g. cocktail bars, pilates, axe throwing"
        />
        <button
          onClick={run}
          disabled={loading}
          className="rounded-btn bg-accent px-4 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Scanning…" : "◎ Discover"}
        </button>
      </div>

      {source && (
        <p className="mt-2 text-[11px] text-muted">
          {source === "google"
            ? "Live Google Places results"
            : "Sample supply graph — add GOOGLE_PLACES_API_KEY for live discovery"}{" "}
          · {results.length} found
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((m, i) => (
            <div key={i} className="rounded-lg border border-hairline px-3 py-2">
              <p className="truncate text-[13px] font-semibold text-ink">{m.name}</p>
              <p className="truncate text-[11px] text-muted">{m.category} · {m.neighborhood}</p>
              <p className="text-[11px] text-ink-2">
                ★ {m.rating || "—"} · {m.reviewCount.toLocaleString()} reviews · {"$".repeat(m.priceLevel || 1)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
