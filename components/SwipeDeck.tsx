"use client";

import { useState, useRef } from "react";
import { type Experience } from "@/lib/data";
import SmartImg from "./SmartImg";

// Tinder-style group voting. Votes stay hidden until everyone's done — removes
// social-pressure bias — then the group detail reveals the winner.
export default function SwipeDeck({
  cards,
  onVote,
  onComplete,
}: {
  cards: Experience[];
  onVote: (expId: string, yes: boolean) => void;
  onComplete: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [drag, setDrag] = useState(0);
  const [leaving, setLeaving] = useState<null | "yes" | "no">(null);
  const startX = useRef<number | null>(null);

  const top = cards[idx];

  const commit = (yes: boolean) => {
    if (!top || leaving) return;
    onVote(top.id, yes);
    setLeaving(yes ? "yes" : "no");
    setTimeout(() => {
      const next = idx + 1;
      setLeaving(null);
      setDrag(0);
      if (next >= cards.length) {
        setIdx(next);
        onComplete();
      } else {
        setIdx(next);
      }
    }, 260);
  };

  if (idx >= cards.length) {
    return (
      <div className="grid place-items-center py-16 text-center">
        <p className="text-4xl">🎉</p>
        <p className="mt-2 text-[15px] font-semibold text-ink">You&apos;ve voted on everything!</p>
        <p className="text-[13px] text-muted">Tallying the group&apos;s picks…</p>
      </div>
    );
  }

  const rot = drag / 18;
  const exitX = leaving === "yes" ? 400 : leaving === "no" ? -400 : drag;

  return (
    <div className="select-none">
      <div className="relative mx-auto h-[420px] w-full max-w-[320px]">
        {/* next card peeking */}
        {cards[idx + 1] && (
          <Card exp={cards[idx + 1]} className="absolute inset-0 scale-[0.96] opacity-70" />
        )}
        {/* top card */}
        <div
          className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
          style={{
            transform: `translateX(${exitX}px) rotate(${leaving ? (leaving === "yes" ? 18 : -18) : rot}deg)`,
            transition: leaving || startX.current === null ? "transform 0.26s ease-out" : "none",
          }}
          onPointerDown={(e) => {
            startX.current = e.clientX;
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (startX.current !== null) setDrag(e.clientX - startX.current);
          }}
          onPointerUp={() => {
            if (Math.abs(drag) > 90) commit(drag > 0);
            else setDrag(0);
            startX.current = null;
          }}
        >
          <Card exp={top}>
            {/* like / nope stamps */}
            <span
              className="absolute left-4 top-4 rounded-lg border-2 border-accent px-3 py-1 text-lg font-extrabold text-accent"
              style={{ opacity: Math.max(0, drag / 90) }}
            >
              YES
            </span>
            <span
              className="absolute right-4 top-4 rounded-lg border-2 border-rose-500 px-3 py-1 text-lg font-extrabold text-rose-500"
              style={{ opacity: Math.max(0, -drag / 90) }}
            >
              NOPE
            </span>
          </Card>
        </div>
      </div>

      {/* controls */}
      <div className="mt-5 flex items-center justify-center gap-6">
        <button
          onClick={() => commit(false)}
          className="grid h-14 w-14 place-items-center rounded-full border border-hairline bg-white text-2xl shadow-card active:scale-95"
          aria-label="Pass"
        >
          👎
        </button>
        <button
          onClick={() => commit(true)}
          className="grid h-16 w-16 place-items-center rounded-full bg-accent text-2xl text-white shadow-pop active:scale-95"
          aria-label="Like"
        >
          ❤️
        </button>
      </div>
      <p className="mt-3 text-center text-[12px] text-muted">
        {idx + 1} of {cards.length} · swipe or tap
      </p>
    </div>
  );
}

function Card({
  exp,
  className = "",
  children,
}: {
  exp: Experience;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`relative h-full w-full overflow-hidden rounded-3xl bg-hairline shadow-pop ${className}`}>
      <SmartImg src={exp.images[0]} seed={`${exp.id}-deck`} alt={exp.title} className="h-full w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12 text-white">
        <p className="text-[12px] font-medium opacity-90">
          {exp.category} · {exp.neighborhood}
        </p>
        <h3 className="text-[19px] font-bold leading-tight">{exp.title}</h3>
        <p className="mt-1 text-[13px] opacity-90">
          ★ {exp.rating.toFixed(2)} · ${exp.price} all-in
        </p>
      </div>
      {children}
    </div>
  );
}
