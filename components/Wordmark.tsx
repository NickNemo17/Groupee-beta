// Groupee brand lockup — a rounded-square "G" monogram (the pin/marker nod) +
// wordmark. Gives the consumer header and Partner Studio a real visual anchor.

export default function Wordmark({
  size = "md",
  sub,
}: {
  size?: "sm" | "md";
  sub?: string;
}) {
  const box = size === "sm" ? 22 : 28;
  const text = size === "sm" ? "text-[15px]" : "text-[18px]";
  return (
    <div className="flex items-center gap-2">
      <span
        className="grid shrink-0 place-items-center rounded-[8px] bg-accent font-extrabold text-white"
        style={{ width: box, height: box, fontSize: box * 0.62, lineHeight: 1 }}
        aria-hidden
      >
        G
      </span>
      <span className="leading-tight">
        <span className={`block font-extrabold tracking-tight text-ink ${text}`}>Groupee</span>
        {sub && <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted">{sub}</span>}
      </span>
    </div>
  );
}
