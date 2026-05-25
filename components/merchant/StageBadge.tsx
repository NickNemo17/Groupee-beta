import { type Stage } from "@/lib/merchants";

const STYLES: Record<Stage, string> = {
  Discovered: "bg-slate-100 text-slate-600",
  Qualified: "bg-blue-50 text-blue-700",
  "Proposal sent": "bg-amber-50 text-amber-700",
  Replied: "bg-violet-50 text-violet-700",
  "Call booked": "bg-indigo-50 text-indigo-700",
  Onboarded: "bg-accent-soft text-accent-deep",
};

export default function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STYLES[stage]}`}>
      {stage}
    </span>
  );
}
