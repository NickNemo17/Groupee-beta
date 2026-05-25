"use client";

import Link from "next/link";
import { useState } from "react";
import { type Experience } from "@/lib/data";
import { experienceValue } from "@/lib/value";
import SmartImg from "./SmartImg";
import HeartButton from "./HeartButton";
import ValueBadge from "./ValueBadge";

export default function ExperienceCard({
  exp,
  reason,
}: {
  exp: Experience;
  reason?: string;
}) {
  const [idx, setIdx] = useState(0);
  const imgs = exp.images;
  const val = experienceValue(exp);

  return (
    <Link href={`/experience/${exp.id}`} className="block group">
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-hairline">
        <SmartImg
          src={imgs[idx]}
          seed={`${exp.id}-${idx}`}
          alt={exp.title}
          className="h-full w-full object-cover transition group-active:scale-[1.02]"
        />

        <ValueBadge tier={val.tier} className="absolute left-3 top-3" />
        {exp.newOnGroupee && (
          <span className="absolute left-3 top-11 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-accent-deep shadow-card">
            ✦ New partner
          </span>
        )}

        <HeartButton id={exp.id} className="absolute right-2.5 top-2.5 h-9 w-9" />

        {/* carousel dots */}
        {imgs.length > 1 && (
          <div className="absolute inset-x-0 bottom-2.5 flex items-center justify-center gap-1.5">
            {imgs.map((_, i) => (
              <button
                key={i}
                aria-label={`Photo ${i + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  setIdx(i);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? "w-1.5 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-2.5">
        {reason && (
          <div className="mb-1 flex items-center gap-1 text-[12px] font-medium text-accent-dark">
            <span>✨</span>
            <span>{reason}</span>
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold leading-snug text-ink line-clamp-1">
            {exp.title}
          </h3>
          <span className="flex shrink-0 items-center gap-1 text-[13px] font-medium text-ink">
            <span className="text-ink">★</span>
            {exp.rating.toFixed(2)}
          </span>
        </div>
        <p className="mt-0.5 text-[13px] text-muted line-clamp-1">
          {exp.neighborhood} · {exp.distanceMi} mi away{exp.localFavorite ? " · Local favorite" : ""}
        </p>
        <p className="mt-1 text-[14px] text-ink">
          <span className="font-semibold">${exp.price}</span>
          <span className="text-muted"> all-in · person</span>
        </p>
      </div>
    </Link>
  );
}
