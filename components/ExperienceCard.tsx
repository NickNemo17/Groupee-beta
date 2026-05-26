"use client";

import Link from "next/link";
import { type Experience } from "@/lib/data";
import { experienceValue } from "@/lib/value";
import SmartImg from "./SmartImg";
import HeartButton from "./HeartButton";
import ScoreSeal from "./ScoreSeal";

// Score-forward leaderboard row: the value seal leads, photo is a thumbnail.
export default function ExperienceCard({
  exp,
  rank,
}: {
  exp: Experience;
  rank?: number;
}) {
  const val = experienceValue(exp);
  const barColor =
    val.tier === "Great value"
      ? "var(--color-accent)"
      : val.tier === "Good value"
        ? "var(--color-accent-dark)"
        : "var(--color-score-cool)";

  return (
    <Link
      href={`/experience/${exp.id}`}
      className="group flex items-stretch gap-3 rounded-card border border-hairline bg-white p-2.5 transition-all duration-200 hover:border-accent/40 hover:shadow-card"
    >
      <ScoreSeal value={val} size="md" top={rank === 1} showBreakdown className="self-center" />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-bold leading-snug text-ink line-clamp-1">{exp.title}</h3>
          <HeartButton id={exp.id} className="-mr-1 -mt-1 h-8 w-8 shrink-0" />
        </div>
        <p className="mt-0.5 text-[12px] text-muted line-clamp-1">
          {exp.category} · {exp.neighborhood}
          {exp.localFavorite ? " · Groupee pick" : ""}
          {exp.newOnGroupee ? " · ✦ New partner" : ""}
        </p>
        {/* value bar */}
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas">
          <div className="h-full rounded-full" style={{ width: `${val.score}%`, background: barColor }} />
        </div>
        <p className="mt-1.5 font-mono text-[14px] font-bold tabular-nums text-ink">
          ${exp.price}
          <span className="text-[11px] font-medium text-muted"> all-in · ★{exp.rating.toFixed(2)}</span>
        </p>
      </div>

      <div className="h-[68px] w-[68px] shrink-0 self-center overflow-hidden rounded-xl bg-hairline">
        <SmartImg src={exp.images[0]} seed={`${exp.id}-thumb`} alt={exp.title} className="h-full w-full object-cover" />
      </div>
    </Link>
  );
}
