"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  getConciergeReply,
  proactiveOpener,
  dayPart,
  SUGGESTED_PROMPTS,
  type ConciergeResult,
} from "@/lib/concierge";
import { getExperience, type Experience } from "@/lib/data";
import SmartImg from "@/components/SmartImg";

interface Msg {
  role: "user" | "ai";
  text?: string;
  result?: ConciergeResult;
}

export default function ConciergePage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // proactive, context-aware opener on first load
  useEffect(() => {
    setMsgs([{ role: "ai", result: proactiveOpener(dayPart(), false) }]);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);

    let result: ConciergeResult;
    try {
      // Live Claude concierge (falls back to the local engine server-side if
      // no ANTHROPIC_API_KEY); this fetch also falls back on any error.
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, when: dayPart() }),
      });
      if (!res.ok) throw new Error("bad status");
      const data = (await res.json()) as {
        intro: string;
        picks: { id: string; reason: string }[];
      };
      const experiences = data.picks
        .map((p) => {
          const exp = getExperience(p.id);
          return exp ? { exp, reason: p.reason } : null;
        })
        .filter((x): x is { exp: Experience; reason: string } => x !== null);
      result =
        experiences.length > 0
          ? { intro: data.intro, experiences }
          : getConciergeReply(text);
    } catch {
      result = getConciergeReply(text);
    }

    setMsgs((m) => [...m, { role: "ai", result }]);
    setTyping(false);
  };

  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="shrink-0 border-b border-hairline px-4 pb-3 pt-3">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-accent text-white">✦</div>
          <div>
            <h1 className="text-[17px] font-bold leading-tight text-ink">Concierge</h1>
            <p className="text-[12px] text-accent-dark">Knows your taste · live local picks</p>
          </div>
        </div>
      </div>

      {/* conversation */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
        <div className="flex flex-col gap-4">
          {msgs.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="self-end rounded-2xl rounded-br-sm bg-ink px-4 py-2.5 text-[14px] text-white">
                {m.text}
              </div>
            ) : (
              <div key={i} className="animate-pop-in">
                <div className="max-w-[88%] rounded-2xl rounded-bl-sm bg-canvas px-4 py-2.5 text-[14px] text-ink">
                  {m.result?.intro}
                </div>
                {m.result && (
                  <div className="mt-3 flex flex-col gap-3">
                    {m.result.experiences.map(({ exp, reason }) => (
                      <ConciergeCard key={exp.id} exp={exp} reason={reason} />
                    ))}
                  </div>
                )}
              </div>
            )
          )}
          {typing && (
            <div className="flex items-center gap-1.5 self-start rounded-2xl bg-canvas px-4 py-3">
              <Dot /> <Dot d="0.15s" /> <Dot d="0.3s" />
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* suggested prompts + input */}
      <div className="shrink-0 border-t border-hairline bg-white px-3 pb-3 pt-2">
        <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="shrink-0 rounded-full border border-hairline bg-white px-3 py-1.5 text-[12px] text-ink-2"
            >
              {p}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 rounded-full border border-hairline px-4 py-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for anything — “sunset date under $40”"
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-white"
            aria-label="Send"
          >
            ↑
          </button>
        </form>
      </div>
    </div>
  );
}

function ConciergeCard({ exp, reason }: { exp: Experience; reason: string }) {
  return (
    <Link
      href={`/experience/${exp.id}`}
      className="flex gap-3 rounded-card border border-hairline bg-white p-2.5 shadow-card"
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-hairline">
        <SmartImg src={exp.images[0]} seed={`${exp.id}-c`} alt={exp.title} className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-accent-dark">
          <span>✨</span>
          <span className="truncate">{reason}</span>
        </div>
        <p className="mt-0.5 text-[14px] font-semibold leading-tight text-ink line-clamp-2">{exp.title}</p>
        <p className="mt-1 text-[12px] text-muted">
          ★ {exp.rating.toFixed(2)} · {exp.neighborhood}
        </p>
        <p className="text-[13px] font-semibold text-ink">
          ${exp.price} <span className="font-normal text-muted">all-in</span>
        </p>
      </div>
    </Link>
  );
}

function Dot({ d = "0s" }: { d?: string }) {
  return (
    <span
      className="h-2 w-2 animate-bounce rounded-full bg-muted"
      style={{ animationDelay: d }}
    />
  );
}
