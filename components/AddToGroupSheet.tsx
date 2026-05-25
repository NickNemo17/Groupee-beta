"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EXPERIENCES, type Experience } from "@/lib/data";
import { useGroupee } from "@/lib/store";

// Build a candidate set: the chosen experience + similar ones to vote between.
function candidatesFor(exp: Experience): string[] {
  const similar = EXPERIENCES.filter(
    (e) =>
      e.id !== exp.id &&
      (e.category === exp.category || e.tags.some((t) => exp.tags.includes(t)))
  )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4)
    .map((e) => e.id);
  return [exp.id, ...similar];
}

export default function AddToGroupSheet({ exp, onDone }: { exp: Experience; onDone: () => void }) {
  const { groups, createGroup } = useGroupee();
  const router = useRouter();
  const [name, setName] = useState("Weekend crew");

  const start = () => {
    const id = createGroup(name.trim() || "Weekend crew", candidatesFor(exp));
    onDone();
    router.push(`/groups/${id}`);
  };

  return (
    <div className="pb-2">
      <p className="text-[14px] text-muted">
        Start a group around <span className="font-semibold text-ink">{exp.title}</span>. We&apos;ll add a
        few similar options so everyone can swipe and vote.
      </p>

      <label className="mt-4 block text-[13px] font-semibold text-ink">Group name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-hairline px-3 py-2.5 text-[14px] outline-none focus:border-accent"
      />

      <button
        onClick={start}
        className="mt-4 w-full rounded-btn bg-accent py-3.5 text-[15px] font-semibold text-white"
      >
        Create group & start voting
      </button>

      {groups.length > 0 && (
        <>
          <p className="mt-5 text-[12px] font-semibold uppercase tracking-wide text-muted">
            Your groups
          </p>
          <div className="mt-2 space-y-2">
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  onDone();
                  router.push(`/groups/${g.id}`);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-hairline px-4 py-3 text-left"
              >
                <span className="text-[14px] font-medium text-ink">{g.name}</span>
                <span className="text-[12px] text-muted">{g.members.length} people · {g.code}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
