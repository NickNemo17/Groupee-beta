"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { dealsForBusiness, businessFor } from "@/lib/business";
import ExperienceCard from "@/components/ExperienceCard";
import SmartImg from "@/components/SmartImg";

export default function BusinessPage() {
  const { slug } = useParams<{ slug: string }>();
  const deals = dealsForBusiness(slug);

  if (deals.length === 0) {
    return (
      <div className="grid h-full place-items-center text-center text-muted">
        <div>
          <p className="text-4xl">🏷️</p>
          <p className="mt-2">Business not found.</p>
          <Link href="/" className="mt-3 inline-block text-accent-dark">← Explore</Link>
        </div>
      </div>
    );
  }

  const biz = businessFor(deals[0]);

  return (
    <div className="flex h-full flex-col">
      <div className="relative overflow-y-auto no-scrollbar pb-24">
        {/* cover photo */}
        <div className="relative h-40 w-full bg-hairline">
          <SmartImg src={biz.image} seed={`${biz.slug}-cover`} alt={biz.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          <button
            onClick={() => history.back()}
            className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-card"
            aria-label="Back"
          >
            ←
          </button>
        </div>

        <div className="px-4">
          {/* avatar overlapping the cover */}
          <div className="-mt-7 flex items-end gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white bg-white shadow-card">
              <SmartImg src={biz.image} seed={`${biz.slug}-logo`} alt={biz.name} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[20px] font-bold leading-tight text-ink">{biz.name}</h1>
                {biz.topRated && (
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-deep">
                    ✓ Top-rated
                  </span>
                )}
              </div>
              <p className="text-[12px] text-muted">{biz.neighborhood}, Santa Barbara</p>
            </div>
          </div>

          <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{biz.bio}</p>
          <p className="mt-1.5 text-[12px] text-muted">Operating since {biz.since} · vetted by Groupee</p>

          <p className="mb-3 mt-6 text-[13px] font-semibold text-ink">
            {deals.length > 1 ? `${deals.length} deals on Groupee` : `Deals from ${biz.name}`}
          </p>
          <div className="flex flex-col gap-6">
            {deals.map((e) => (
              <ExperienceCard key={e.id} exp={e} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
