"use client";

import { type Group } from "@/lib/store";
import { useGroupee } from "@/lib/store";

// Splitwise-style cost split, but with the most-requested missing feature:
// the group approves the expense (vote-on-expense) before it's committed.
export default function SplitPanel({ group }: { group: Group }) {
  const { approveExpense } = useGroupee();
  const exp = group.expense;
  if (!exp) return null;

  const youApproved = exp.approvals.includes("You") || exp.approved;
  const pending = group.members.filter((m) => !exp.approvals.includes(m.name));

  return (
    <div className="rounded-card border border-hairline p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-ink">Split the cost</h3>
        <span className="text-[13px] text-muted">{group.members.length} people</span>
      </div>

      <div className="mt-3 flex items-end justify-between border-b border-hairline pb-3">
        <div>
          <p className="text-[12px] text-muted">Total (all-in)</p>
          <p className="text-[22px] font-extrabold text-ink">${exp.total}</p>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-muted">Each person</p>
          <p className="text-[22px] font-extrabold text-accent-dark">${exp.perPerson}</p>
        </div>
      </div>

      {/* who owes what */}
      <div className="mt-3 space-y-2">
        {group.members.map((m) => {
          const approved = exp.approved || exp.approvals.includes(m.name);
          return (
            <div key={m.name} className="flex items-center gap-3">
              <img src={m.avatar} alt={m.name} className="h-8 w-8 rounded-full object-cover" />
              <span className="flex-1 text-[14px] text-ink">{m.name}</span>
              <span className="text-[14px] font-medium text-ink">${exp.perPerson}</span>
              <span className={`text-[12px] ${approved ? "text-accent-dark" : "text-muted"}`}>
                {approved ? "✓ in" : "pending"}
              </span>
            </div>
          );
        })}
      </div>

      {!youApproved ? (
        <button
          onClick={() => approveExpense(group.id)}
          className="mt-4 w-full rounded-btn bg-accent py-3 text-[15px] font-semibold text-white"
        >
          Approve my ${exp.perPerson} share
        </button>
      ) : (
        <div className="mt-4 rounded-xl bg-accent-soft px-4 py-3 text-center">
          <p className="text-[14px] font-semibold text-accent-dark">All settled — everyone&apos;s in 🎉</p>
          <p className="text-[12px] text-ink-2">No fees on splits for Groupee+ members.</p>
        </div>
      )}
      {!youApproved && pending.length > 0 && (
        <p className="mt-2 text-center text-[12px] text-muted">
          Waiting on you{pending.length > 1 ? ` + ${pending.length - 1} other` : ""}
        </p>
      )}
    </div>
  );
}
