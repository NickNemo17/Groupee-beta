"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGroupee } from "@/lib/store";
import { EXPERIENCES, getExperience } from "@/lib/data";
import SmartImg from "@/components/SmartImg";

export default function GroupsPage() {
  const { groups, createGroup } = useGroupee();
  const router = useRouter();

  const startQuick = () => {
    // a ready-to-vote crew across a mix of top-rated, group-friendly experiences
    const candidates = EXPERIENCES.filter((e) => e.goodForGroups)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6)
      .map((e) => e.id);
    const id = createGroup("Weekend crew", candidates);
    router.push(`/groups/${id}`);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-hairline px-4 pb-3 pt-3">
        <h1 className="text-[20px] font-bold text-ink">Groups</h1>
        <p className="text-[13px] text-muted">Decide together — swipe, vote, split. No 200-text debate.</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
        <button
          onClick={startQuick}
          className="flex w-full items-center justify-between rounded-card bg-accent px-4 py-4 text-white shadow-card"
        >
          <div className="text-left">
            <p className="text-[15px] font-bold">Start a group plan</p>
            <p className="text-[12px] opacity-90">Invite friends with a 4-letter code</p>
          </div>
          <span className="text-2xl">+</span>
        </button>

        {groups.length === 0 ? (
          <div className="mt-12 text-center text-muted">
            <p className="text-4xl">👯</p>
            <p className="mt-2 text-[14px]">No groups yet.</p>
            <p className="text-[13px]">Start one above, or hit “+ Group” on any experience.</p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {groups
              .slice()
              .reverse()
              .map((g) => {
                const decided = g.decidedId ? getExperience(g.decidedId) : null;
                const hero = decided ?? getExperience(g.candidateIds[0]);
                const phase = g.plan ? "Planned" : g.youDone ? "Decided" : "Voting";
                return (
                  <Link
                    key={g.id}
                    href={`/groups/${g.id}`}
                    className="flex items-center gap-3 rounded-card border border-hairline p-2.5"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-hairline">
                      {hero && (
                        <SmartImg src={hero.images[0]} seed={`${g.id}-hero`} alt={g.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[15px] font-semibold text-ink">{g.name}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            phase === "Planned"
                              ? "bg-accent-soft text-accent-dark"
                              : phase === "Decided"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-canvas text-ink-2"
                          }`}
                        >
                          {phase}
                        </span>
                      </div>
                      <p className="text-[12px] text-muted">
                        {g.members.length} people · code {g.code}
                      </p>
                      <div className="mt-1 flex -space-x-2">
                        {g.members.slice(0, 4).map((m) => (
                          <img
                            key={m.name}
                            src={m.avatar}
                            alt={m.name}
                            className="h-6 w-6 rounded-full border-2 border-white object-cover"
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-muted">›</span>
                  </Link>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
