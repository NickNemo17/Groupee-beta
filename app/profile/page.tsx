"use client";

import { useState } from "react";
import Link from "next/link";
import { useGroupee } from "@/lib/store";
import { CATEGORIES, EXPERIENCES, type Category } from "@/lib/data";
import SmartImg from "@/components/SmartImg";

const VIBES = ["Date night", "With friends", "Solo & calm", "Adventurous", "Foodie", "Budget-friendly"];

export default function ProfilePage() {
  const { taste, setTaste, wishlist, member, joinMembership } = useGroupee();
  const [cats, setCats] = useState<Category[]>(taste.categories);
  const [vibes, setVibes] = useState<string[]>(taste.vibes);
  const [freq, setFreq] = useState<"daily" | "weekly" | "off">("weekly");

  const saved = EXPERIENCES.filter((e) => wishlist.includes(e.id));

  const toggle = <T,>(arr: T[], v: T, set: (a: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  // ── Onboarding quiz (cold-start taste capture) ──
  if (!taste.done) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-hairline px-4 pb-3 pt-3">
          <h1 className="text-[20px] font-bold text-ink">Let&apos;s tune your feed</h1>
          <p className="text-[13px] text-muted">Two taps. The concierge & Explore use this from the start.</p>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
          <h2 className="text-[15px] font-bold text-ink">What do you love?</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c.key} active={cats.includes(c.key)} onClick={() => toggle(cats, c.key, setCats)}>
                {c.icon} {c.label}
              </Chip>
            ))}
          </div>

          <h2 className="mt-6 text-[15px] font-bold text-ink">What&apos;s your vibe?</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {VIBES.map((v) => (
              <Chip key={v} active={vibes.includes(v)} onClick={() => toggle(vibes, v, setVibes)}>
                {v}
              </Chip>
            ))}
          </div>

          <button
            disabled={cats.length === 0}
            onClick={() => setTaste({ categories: cats, vibes, done: true })}
            className="mt-8 w-full rounded-btn bg-accent py-3.5 text-[15px] font-semibold text-white disabled:opacity-40"
          >
            Save my taste
          </button>
          <button
            onClick={() => setTaste({ done: true })}
            className="mt-2 w-full py-2 text-[13px] text-muted"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  // ── Profile ──
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-hairline px-4 pb-3 pt-3">
        <h1 className="text-[20px] font-bold text-ink">Profile</h1>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
        {/* identity */}
        <div className="flex items-center gap-3">
          <img src="https://i.pravatar.cc/120?u=groupee-you" alt="You" className="h-14 w-14 rounded-full object-cover" />
          <div>
            <p className="text-[16px] font-bold text-ink">You</p>
            <p className="text-[13px] text-muted">{member ? "Groupee+ member" : "Santa Barbara"}</p>
          </div>
        </div>

        {/* membership — the non-discount monetization story */}
        {!member ? (
          <div className="mt-4 overflow-hidden rounded-card bg-gradient-to-br from-ink to-[#333] p-4 text-white">
            <p className="text-[15px] font-bold">Groupee+</p>
            <p className="mt-1 text-[13px] opacity-90">
              Early access to new experiences · fee-free splits · premium group tools · members-only events.
            </p>
            <p className="mt-2 text-[12px] opacity-75">No discount death-spiral — just real perks, $9/mo.</p>
            <button
              onClick={joinMembership}
              className="mt-3 rounded-btn bg-accent px-4 py-2 text-[14px] font-semibold text-white"
            >
              Try free for 30 days
            </button>
          </div>
        ) : (
          <div className="mt-4 rounded-card bg-accent-soft p-4">
            <p className="text-[14px] font-semibold text-accent-dark">✓ Groupee+ active</p>
            <p className="text-[12px] text-ink-2">Splits are fee-free and you&apos;ve got early access to new drops.</p>
          </div>
        )}

        {/* taste */}
        <Section title="Your taste">
          <div className="flex flex-wrap gap-2">
            {taste.categories.map((c) => (
              <span key={c} className="rounded-full bg-canvas px-3 py-1 text-[13px] text-ink-2">
                {CATEGORIES.find((x) => x.key === c)?.icon} {c}
              </span>
            ))}
            {taste.vibes.map((v) => (
              <span key={v} className="rounded-full bg-canvas px-3 py-1 text-[13px] text-ink-2">{v}</span>
            ))}
          </div>
          <button onClick={() => setTaste({ done: false })} className="mt-2 text-[13px] font-semibold text-accent-dark">
            Edit taste
          </button>
        </Section>

        {/* wishlists */}
        <Section title={`Saved (${saved.length})`}>
          {saved.length === 0 ? (
            <p className="text-[13px] text-muted">Tap the ♥ on any experience to save it here.</p>
          ) : (
            <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
              {saved.map((e) => (
                <Link key={e.id} href={`/experience/${e.id}`} className="w-32 shrink-0">
                  <div className="aspect-square overflow-hidden rounded-xl bg-hairline">
                    <SmartImg src={e.images[0]} seed={`${e.id}-save`} alt={e.title} className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-1 text-[12px] font-medium leading-tight text-ink line-clamp-2">{e.title}</p>
                </Link>
              ))}
            </div>
          )}
        </Section>

        {/* notifications — explicit answer to Groupon's spam fatigue */}
        <Section title="Notifications">
          <p className="text-[12px] text-muted">
            We&apos;ll never blast you. Pick a cadence — that&apos;s it.
          </p>
          <div className="mt-2 flex gap-2">
            {(["daily", "weekly", "off"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFreq(f)}
                className={`flex-1 rounded-xl border py-2.5 text-[13px] font-medium capitalize ${
                  freq === f ? "border-accent bg-accent-soft text-accent-dark" : "border-hairline text-ink-2"
                }`}
              >
                {f === "off" ? "Off" : f}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-accent-dark">
            {freq === "off"
              ? "Silence. We respect it."
              : freq === "weekly"
                ? "One thoughtful weekly digest. (Recommended)"
                : "A daily nudge — capped at one."}
          </p>
        </Section>

        <p className="mt-8 text-center text-[11px] text-muted">
          Groupee beta · local, together · v0.1
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-muted">{title}</h2>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition ${
        active ? "border-accent bg-accent-soft text-accent-dark" : "border-hairline text-ink-2"
      }`}
    >
      {children}
    </button>
  );
}
