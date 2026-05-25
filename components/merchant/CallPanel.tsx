"use client";

import { useEffect, useRef, useState } from "react";
import { type Prospect } from "@/lib/merchants";

const MERCHANT_REPLIES = [
  "Sure, go ahead — you've got thirty seconds.",
  "Yeah… Tuesdays are dead, you're not wrong about that.",
  "Okay. And there's no big upfront cost to me?",
  "Huh. That's actually a lot better than the Groupon pitch I got last year.",
  "Alright — send it over. Let's try it.",
];

interface Line {
  who: "agent" | "merchant";
  text: string;
}

export default function CallPanel({
  prospect,
  talkingPoints,
  onComplete,
}: {
  prospect: Prospect;
  talkingPoints: string[];
  onComplete: () => void;
}) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [running, setRunning] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // interleave agent talking points with plausible merchant replies
  const lines: Line[] = [];
  talkingPoints.forEach((t, i) => {
    lines.push({ who: "agent", text: t });
    if (MERCHANT_REPLIES[i]) lines.push({ who: "merchant", text: MERCHANT_REPLIES[i] });
  });

  useEffect(() => {
    fetch("/api/voice").then((r) => r.json()).then((d) => setAvailable(Boolean(d.available))).catch(() => setAvailable(false));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [revealed]);

  const run = async () => {
    if (running) return;
    setRunning(true);
    setRevealed(0);

    // play audio of the agent's pitch if a key is configured
    if (available) {
      setLoadingAudio(true);
      try {
        const res = await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: talkingPoints.join(" ") }),
        });
        if (res.headers.get("content-type")?.includes("audio")) {
          const url = URL.createObjectURL(await res.blob());
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.play().catch(() => {});
          audio.onended = () => URL.revokeObjectURL(url);
        }
      } catch {}
      setLoadingAudio(false);
    }

    // reveal transcript line by line
    let i = 0;
    const tick = () => {
      i += 1;
      setRevealed(i);
      if (i < lines.length) {
        setTimeout(tick, lines[i - 1].who === "agent" ? 1700 : 1100);
      } else {
        setRunning(false);
        onComplete();
      }
    };
    setTimeout(tick, 300);
  };

  return (
    <div className="rounded-xl border border-hairline bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-bold text-ink">AI voice agent → {prospect.contact.owner}</h3>
          <p className="text-[12px] text-muted">{prospect.contact.phone} · ElevenLabs · consent on file</p>
        </div>
        <button
          onClick={run}
          disabled={running}
          className="rounded-btn bg-accent px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
        >
          {running ? (loadingAudio ? "Connecting…" : "On call…") : revealed > 0 ? "Replay call" : "▶ Place call"}
        </button>
      </div>

      {available === false && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
          Add <code>ELEVENLABS_API_KEY</code> to <code>.env.local</code> to hear the agent speak. Showing the transcript only.
        </p>
      )}

      <div className="max-h-72 space-y-2 overflow-y-auto">
        {revealed === 0 && (
          <p className="py-6 text-center text-[12px] text-muted">Press “Place call” to run the agent.</p>
        )}
        {lines.slice(0, revealed).map((l, i) => (
          <div key={i} className={`flex ${l.who === "agent" ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-snug ${
                l.who === "agent" ? "rounded-bl-sm bg-accent-soft text-ink" : "rounded-br-sm bg-canvas text-ink-2"
              }`}
            >
              <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-muted">
                {l.who === "agent" ? "Groupee agent" : prospect.contact.owner}
              </span>
              {l.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
