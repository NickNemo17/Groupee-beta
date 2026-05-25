"use client";

import Link from "next/link";
import { useGroupee } from "@/lib/store";
import { getExperience } from "@/lib/data";
import { prettyDate } from "@/lib/slots";
import SmartImg from "@/components/SmartImg";
import EmptyState from "@/components/EmptyState";

export default function TripsPage() {
  const { trips } = useGroupee();
  const sorted = trips.slice().sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-hairline px-4 pb-3 pt-3">
        <h1 className="text-[20px] font-bold text-ink">Trips</h1>
        <p className="text-[13px] text-muted">Your upcoming plans, in order — not a pile of receipts.</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
        {sorted.length === 0 ? (
          <EmptyState
            icon="🗓️"
            title="No plans yet"
            subtitle="Book an experience or commit a group plan and it shows up here."
            cta={{ href: "/", label: "Explore experiences" }}
          />
        ) : (
          <div className="space-y-4">
            {sorted.map((t) => {
              const exp = getExperience(t.expId);
              if (!exp) return null;
              return (
                <Link
                  key={t.id}
                  href={`/experience/${exp.id}`}
                  className="block overflow-hidden rounded-card border border-hairline"
                >
                  <div className="relative aspect-[16/9] bg-hairline">
                    <SmartImg src={exp.images[0]} seed={`${exp.id}-trip`} alt={exp.title} className="h-full w-full object-cover" />
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        t.source === "group" ? "bg-accent text-white" : "bg-white/95 text-ink"
                      }`}
                    >
                      {t.source === "group" ? `👯 ${t.groupName}` : "Solo"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-[15px] font-semibold text-ink">{exp.title}</p>
                      <p className="text-[13px] text-muted">
                        {prettyDate(t.date)} · {t.time} · {t.partySize} {t.partySize === 1 ? "guest" : "guests"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[15px] font-bold text-ink">${t.total}</p>
                      <p className="text-[11px] text-muted">all-in</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
