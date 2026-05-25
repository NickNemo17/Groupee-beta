"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useGroupee } from "@/lib/store";
import { getExperience } from "@/lib/data";
import { nextDays, slotsFor, prettyDate } from "@/lib/slots";
import SwipeDeck from "@/components/SwipeDeck";
import SplitPanel from "@/components/SplitPanel";
import SmartImg from "@/components/SmartImg";

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getGroup, castVote, finishVoting, commitPlan } = useGroupee();
  const group = getGroup(id);

  const [, force] = useState(0);
  const days = nextDays(5);
  const [date, setDate] = useState(days[0].iso);

  if (!group) {
    return (
      <div className="grid h-full place-items-center text-center text-muted">
        <div>
          <p className="text-4xl">🫥</p>
          <p className="mt-2">Group not found.</p>
          <Link href="/groups" className="mt-3 inline-block text-accent-dark">← Back to Groups</Link>
        </div>
      </div>
    );
  }

  const candidates = group.candidateIds.map((c) => getExperience(c)!).filter(Boolean);
  const decided = group.decidedId ? getExperience(group.decidedId) : null;
  const slots = decided ? slotsFor(decided.bestTime) : [];
  const time = slots[0] ?? "7:00 PM";

  // header
  const header = (
    <div className="border-b border-hairline px-4 pb-3 pt-3">
      <button onClick={() => router.push("/groups")} className="text-[13px] text-muted">
        ← Groups
      </button>
      <h1 className="mt-1 text-[20px] font-bold text-ink">{group.name}</h1>
      <div className="mt-1 flex items-center justify-between">
        <div className="flex -space-x-2">
          {group.members.map((m) => (
            <img
              key={m.name}
              src={m.avatar}
              alt={m.name}
              className="h-7 w-7 rounded-full border-2 border-white object-cover"
            />
          ))}
        </div>
        <span className="rounded-full bg-canvas px-3 py-1 text-[12px] font-semibold text-ink-2">
          Invite code · {group.code}
        </span>
      </div>
    </div>
  );

  // PHASE 1 — voting
  if (!group.youDone) {
    return (
      <div className="flex h-full flex-col">
        {header}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-accent-soft px-3 py-2">
            <span>🗳️</span>
            <p className="text-[12px] text-accent-dark">
              {group.members.length - 1} friends already voted — votes stay hidden until you finish.
            </p>
          </div>
          <SwipeDeck
            cards={candidates}
            onVote={(expId, yes) => castVote(group.id, expId, yes)}
            onComplete={() => {
              finishVoting(group.id);
              force((n) => n + 1);
            }}
          />
        </div>
      </div>
    );
  }

  // PHASE 3 — committed plan + split
  if (group.plan && decided) {
    return (
      <div className="flex h-full flex-col">
        {header}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
          <div className="rounded-card border border-hairline p-3">
            <div className="flex gap-3">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-hairline">
                <SmartImg src={decided.images[0]} seed={`${decided.id}-plan`} alt={decided.title} className="h-full w-full object-cover" />
              </div>
              <div>
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-dark">
                  ✓ Plan locked in
                </span>
                <p className="mt-1 text-[15px] font-bold leading-tight text-ink">{decided.title}</p>
                <p className="mt-0.5 text-[13px] text-muted">
                  {prettyDate(group.plan.date)} · {group.plan.time}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <SplitPanel group={group} />
          </div>

          <Link
            href="/trips"
            className="mt-4 block rounded-btn bg-ink py-3 text-center text-[15px] font-semibold text-white"
          >
            See it in Trips
          </Link>
        </div>
      </div>
    );
  }

  // PHASE 2 — decided, reveal + commit
  const likes = decided
    ? group.members.filter((m) => group.votes[m.name]?.[decided.id])
    : [];

  return (
    <div className="flex h-full flex-col">
      {header}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
        <p className="text-center text-[13px] font-semibold uppercase tracking-wide text-accent-dark">
          The group picked
        </p>
        {decided && (
          <>
            <Link href={`/experience/${decided.id}`} className="mt-2 block overflow-hidden rounded-card shadow-card">
              <div className="relative aspect-[16/10] bg-hairline">
                <SmartImg src={decided.images[0]} seed={`${decided.id}-win`} alt={decided.title} className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10 text-white">
                  <h2 className="text-[19px] font-bold">{decided.title}</h2>
                  <p className="text-[13px] opacity-90">★ {decided.rating.toFixed(2)} · ${decided.price} all-in</p>
                </div>
              </div>
            </Link>

            {/* vote reveal */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex -space-x-2">
                {likes.map((m) => (
                  <img key={m.name} src={m.avatar} alt={m.name} className="h-7 w-7 rounded-full border-2 border-white object-cover" />
                ))}
              </div>
              <p className="text-[13px] text-muted">
                {likes.length} of {group.members.length} swiped right ❤️
              </p>
            </div>

            {/* commit: pick date/time */}
            <h3 className="mt-5 text-[15px] font-bold text-ink">Lock in a time</h3>
            <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
              {days.map((d) => (
                <button
                  key={d.iso}
                  onClick={() => setDate(d.iso)}
                  className={`flex w-14 shrink-0 flex-col items-center rounded-xl border py-2 ${
                    date === d.iso ? "border-ink bg-ink text-white" : "border-hairline text-ink-2"
                  }`}
                >
                  <span className="text-[11px]">{d.dow}</span>
                  <span className="text-[16px] font-bold leading-tight">{d.day}</span>
                  <span className="text-[10px]">{d.month}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[12px] text-muted">First slot · {time}</p>

            <button
              onClick={() => {
                commitPlan(group.id, date, time);
                force((n) => n + 1);
              }}
              className="mt-4 w-full rounded-btn bg-accent py-3.5 text-[15px] font-semibold text-white"
            >
              Commit plan & split cost
            </button>
          </>
        )}
      </div>
    </div>
  );
}
