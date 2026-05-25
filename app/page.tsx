"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { CATEGORIES, EXPERIENCES, type Category } from "@/lib/data";
import { useGroupee } from "@/lib/store";
import ExperienceCard from "@/components/ExperienceCard";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-[#e8eae6] text-sm text-muted">
      Loading map…
    </div>
  ),
});

export default function ExplorePage() {
  const { taste } = useGroupee();
  const [cat, setCat] = useState<Category | "All">("All");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"list" | "map">("list");

  const items = useMemo(() => {
    let list = EXPERIENCES.slice();
    if (cat !== "All") list = list.filter((e) => e.category === cat);
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(t) ||
          e.neighborhood.toLowerCase().includes(t) ||
          e.tags.some((tag) => tag.includes(t))
      );
    }
    if (taste.done && taste.categories.length) {
      list.sort((a, b) => {
        const av = taste.categories.includes(a.category) ? 1 : 0;
        const bv = taste.categories.includes(b.category) ? 1 : 0;
        return bv - av || b.rating - a.rating;
      });
    } else {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [cat, q, taste]);

  return (
    <div className="flex h-full flex-col">
      {/* sticky header */}
      <div className="sticky top-0 z-30 bg-white/95 px-4 pb-2 pt-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-dark">
              Groupee
            </p>
            <h1 className="text-[20px] font-bold leading-tight text-ink">
              Santa Barbara, CA
            </h1>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft text-sm">
            📍
          </div>
        </div>

        {/* search pill (Where / When / What) */}
        <div className="mt-3 flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2.5 shadow-card">
          <span className="text-accent">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search experiences, vibes, areas…"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-muted"
          />
          {q && (
            <button onClick={() => setQ("")} className="text-muted" aria-label="Clear">
              ✕
            </button>
          )}
        </div>

        {/* category pills */}
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
          <Pill active={cat === "All"} onClick={() => setCat("All")} label="All" icon="✨" />
          {CATEGORIES.map((c) => (
            <Pill
              key={c.key}
              active={cat === c.key}
              onClick={() => setCat(c.key)}
              label={c.label}
              icon={c.icon}
            />
          ))}
        </div>
      </div>

      {/* body */}
      {view === "map" ? (
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <MapView items={items} />
        </div>
      ) : (
        <div className="flex-1 px-4 pb-24 pt-3">
          <p className="mb-3 text-[13px] text-muted">
            {items.length} {items.length === 1 ? "experience" : "experiences"} ·{" "}
            <span className="text-accent-dark">honest, all-in pricing</span>
          </p>
          <div className="flex flex-col gap-6">
            {items.map((e) => (
              <ExperienceCard key={e.id} exp={e} />
            ))}
            {items.length === 0 && (
              <div className="mt-16 text-center text-muted">
                <p className="text-4xl">🔍</p>
                <p className="mt-2 text-sm">No matches. Try a different vibe.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* list/map toggle */}
      <button
        onClick={() => setView((v) => (v === "list" ? "map" : "list"))}
        className="absolute bottom-[88px] left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3 text-[14px] font-semibold text-white shadow-pop active:scale-95"
      >
        {view === "list" ? (
          <>
            Map
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" strokeLinejoin="round" />
              <path d="M9 4v14M15 6v14" />
            </svg>
          </>
        ) : (
          <>
            List
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}

function Pill({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition ${
        active ? "border-ink bg-ink text-white" : "border-hairline bg-white text-ink-2"
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}
