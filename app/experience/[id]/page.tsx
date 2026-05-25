"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import { getExperience } from "@/lib/data";
import { experienceValue } from "@/lib/value";
import ValueBadge from "@/components/ValueBadge";
import SmartImg from "@/components/SmartImg";
import HeartButton from "@/components/HeartButton";
import BottomSheet from "@/components/BottomSheet";
import BookingSheet from "@/components/BookingSheet";
import AddToGroupSheet from "@/components/AddToGroupSheet";
import RefundBadge from "@/components/RefundBadge";

const MiniMap = dynamic(() => import("@/components/MiniMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#e8eae6]" />,
});

export default function ExperienceDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const exp = getExperience(id);
  const [sheet, setSheet] = useState<null | "book" | "group">(null);

  if (!exp) {
    return (
      <div className="grid h-full place-items-center text-center text-muted">
        <div>
          <p className="text-4xl">🤷</p>
          <p className="mt-2">Experience not found.</p>
        </div>
      </div>
    );
  }

  const val = experienceValue(exp);

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-28">
        {/* hero gallery */}
        <div className="relative">
          <div className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
            {exp.images.map((src, i) => (
              <div key={i} className="aspect-[4/3] w-full shrink-0 snap-center bg-hairline">
                <SmartImg src={src} seed={`${exp.id}-d${i}`} alt={exp.title} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
          <button
            onClick={() => router.back()}
            className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-card"
            aria-label="Back"
          >
            ←
          </button>
          <HeartButton id={exp.id} className="absolute right-3 top-3 h-9 w-9 bg-white/30" />
        </div>

        <div className="px-4">
          {/* title block */}
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <ValueBadge tier={val.tier} />
              {exp.localFavorite && (
                <span className="text-[12px] font-semibold text-accent-dark">★ Local favorite</span>
              )}
            </div>
            <h1 className="mt-1.5 text-[22px] font-bold leading-tight text-ink">{exp.title}</h1>
            <p className="mt-1 text-[14px] text-muted">
              {exp.category} · {exp.neighborhood} · {Math.round(exp.durationMin / 60 * 10) / 10}h
            </p>
          </div>

          {/* rating hero */}
          <div className="mt-4 flex items-center gap-4 rounded-card border border-hairline px-4 py-3">
            <div className="text-center">
              <div className="text-[34px] font-extrabold leading-none text-ink">
                {exp.rating.toFixed(2)}
              </div>
              <div className="mt-1 text-[11px] text-accent">★★★★★</div>
            </div>
            <div className="h-10 w-px bg-hairline" />
            <div>
              <p className="text-[14px] font-semibold text-ink">{val.tier} · cleared our value bar</p>
              <p className="text-[13px] text-muted">{val.blurb}</p>
            </div>
          </div>

          {/* host */}
          <div className="mt-4 flex items-center gap-3 border-b border-hairline pb-4">
            <img src={exp.host.avatar} alt={exp.host.name} className="h-12 w-12 rounded-full object-cover" />
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-ink">
                Hosted by {exp.host.name}
                {exp.host.superhost && (
                  <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-dark">
                    Superhost
                  </span>
                )}
              </p>
              <p className="text-[13px] text-muted">
                Host since {exp.host.since} · {exp.host.responseRate}% response rate
              </p>
            </div>
          </div>

          {/* description */}
          <p className="mt-4 text-[14px] leading-relaxed text-ink-2">{exp.description}</p>

          {/* included */}
          <h2 className="mt-5 text-[16px] font-bold text-ink">What&apos;s included</h2>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {exp.included.map((it) => (
              <div key={it} className="flex items-center gap-2 rounded-xl border border-hairline px-3 py-2.5">
                <span className="text-accent">✓</span>
                <span className="text-[13px] text-ink-2">{it}</span>
              </div>
            ))}
          </div>

          {/* reviews */}
          <h2 className="mt-6 text-[16px] font-bold text-ink">Reviews</h2>
          <div className="no-scrollbar -mx-4 mt-2 flex gap-3 overflow-x-auto px-4">
            {exp.reviews.map((r, i) => (
              <div key={i} className="w-64 shrink-0 rounded-card border border-hairline p-4">
                <div className="flex items-center gap-1 text-[12px] text-accent">
                  {"★".repeat(r.rating)}
                  <span className="ml-1 text-muted">{r.date}</span>
                </div>
                <p className="mt-2 text-[13px] leading-snug text-ink-2">&ldquo;{r.text}&rdquo;</p>
                <p className="mt-2 text-[13px] font-semibold text-ink">— {r.author}</p>
              </div>
            ))}
          </div>

          {/* map */}
          <h2 className="mt-6 text-[16px] font-bold text-ink">Where you&apos;ll be</h2>
          <p className="text-[13px] text-muted">{exp.neighborhood}, Santa Barbara</p>
          <div className="mt-2 h-40 overflow-hidden rounded-card border border-hairline">
            <MiniMap lat={exp.lat} lng={exp.lng} label={exp.neighborhood} />
          </div>

          {/* second-visit nudge — the anti-Groupon loyalty idea, not a one-and-done coupon */}
          <div className="mt-5 rounded-card bg-accent-soft px-4 py-3">
            <p className="text-[13px] font-semibold text-accent-dark">Come back & save</p>
            <p className="text-[12px] text-ink-2">
              Book again within 30 days and {exp.host.name} comps your first drink — Groupee rewards
              loyalty, not one-time bargain-hunting.
            </p>
          </div>
        </div>
      </div>

      {/* sticky book bar */}
      <div className="absolute inset-x-0 bottom-0 z-30 border-t border-hairline bg-white/95 px-4 py-3 backdrop-blur">
        <RefundBadge tier="green" className="mb-2" />
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[16px] font-bold text-ink">
              ${exp.price} <span className="text-[13px] font-normal text-muted">all-in · person</span>
            </p>
          </div>
          <button
            onClick={() => setSheet("group")}
            className="rounded-btn border border-ink px-3 py-3 text-[14px] font-semibold text-ink"
          >
            + Group
          </button>
          <button
            onClick={() => setSheet("book")}
            className="rounded-btn bg-accent px-6 py-3 text-[15px] font-semibold text-white"
          >
            Reserve
          </button>
        </div>
      </div>

      <BottomSheet open={sheet === "book"} onClose={() => setSheet(null)} title={`Book · ${exp.title}`}>
        <BookingSheet exp={exp} onDone={() => setSheet(null)} />
      </BottomSheet>
      <BottomSheet open={sheet === "group"} onClose={() => setSheet(null)} title="Plan with a group">
        <AddToGroupSheet exp={exp} onDone={() => setSheet(null)} />
      </BottomSheet>
    </div>
  );
}
