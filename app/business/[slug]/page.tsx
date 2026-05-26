"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { dealsForBusiness, businessFor } from "@/lib/business";
import ExperienceCard from "@/components/ExperienceCard";

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
      <div className="border-b border-hairline px-4 pb-4 pt-3">
        <button onClick={() => history.back()} className="text-[13px] text-muted">← Back</button>
        <div className="mt-2 flex items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent text-[24px] font-extrabold text-white">
            {biz.name[0]}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[20px] font-bold leading-tight text-ink">{biz.name}</h1>
              {biz.topRated && (
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-deep">
                  ✓ Top-rated operator
                </span>
              )}
            </div>
            <p className="text-[12px] text-muted">{biz.neighborhood}, Santa Barbara</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-2">{biz.bio}</p>
        <p className="mt-1 text-[12px] text-muted">Operating since {biz.since} · vetted by Groupee</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-24 pt-3">
        <p className="mb-3 text-[13px] font-semibold text-ink">
          {deals.length === 1 ? "Their deal on Groupee" : `${deals.length} deals on Groupee`}
        </p>
        <div className="flex flex-col gap-6">
          {deals.map((e) => (
            <ExperienceCard key={e.id} exp={e} />
          ))}
        </div>
      </div>
    </div>
  );
}
