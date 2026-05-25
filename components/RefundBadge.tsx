// Color-coded, plain-English cancellation policy — shown BEFORE the Reserve button.
// Directly answers Groupon's #1 complaint (refund entrapment): refunds go back to your
// original payment method, not platform credit.
export default function RefundBadge({
  tier = "green",
  className = "",
}: {
  tier?: "green" | "amber" | "red";
  className?: string;
}) {
  const map = {
    green: {
      bg: "bg-accent-soft",
      dot: "bg-accent",
      text: "text-accent-dark",
      label: "Free cancellation until 24h before — refunded to your card, not credit",
    },
    amber: {
      bg: "bg-amber-50",
      dot: "bg-amber-500",
      text: "text-amber-700",
      label: "Free cancellation until 12h before — then 50% refundable",
    },
    red: {
      bg: "bg-rose-50",
      dot: "bg-rose-500",
      text: "text-rose-700",
      label: "Non-refundable — final sale (shown up front, never after)",
    },
  }[tier];

  return (
    <div className={`flex items-center gap-2 rounded-xl ${map.bg} px-3 py-2 ${className}`}>
      <span className={`h-2 w-2 shrink-0 rounded-full ${map.dot}`} />
      <span className={`text-[12px] font-medium leading-tight ${map.text}`}>{map.label}</span>
    </div>
  );
}
