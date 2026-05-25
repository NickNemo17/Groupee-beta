"use client";

import { useState } from "react";
import Link from "next/link";
import { type Experience } from "@/lib/data";
import { useGroupee } from "@/lib/store";
import { nextDays, slotsFor } from "@/lib/slots";
import RefundBadge from "./RefundBadge";

const PAY = [
  { id: "apple", label: " Pay", glyph: "" },
  { id: "card", label: "Card", glyph: "💳" },
  { id: "klarna", label: "Klarna · 4 payments", glyph: "▦" },
];

export default function BookingSheet({ exp, onDone }: { exp: Experience; onDone: () => void }) {
  const { bookSolo } = useGroupee();
  const days = nextDays(5);
  const slots = slotsFor(exp.bestTime);

  const [date, setDate] = useState(days[0].iso);
  const [time, setTime] = useState(slots[0]);
  const [party, setParty] = useState(2);
  const [pay, setPay] = useState("apple");
  const [confirmed, setConfirmed] = useState(false);

  const total = exp.price * party;

  if (confirmed) {
    return (
      <div className="pb-2 pt-2 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent-soft text-3xl">
          ✓
        </div>
        <h3 className="mt-3 text-[18px] font-bold text-ink">You&apos;re booked!</h3>
        <p className="mt-1 text-[14px] text-muted">
          {exp.title} · {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })} at {time} · {party} {party === 1 ? "guest" : "guests"}
        </p>

        {/* support one tap away — answers the "buried support" complaint */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-hairline px-4 py-3 text-left">
          <div>
            <p className="text-[13px] font-semibold text-ink">Need help?</p>
            <p className="text-[12px] text-muted">A real person replies in ~2 min</p>
          </div>
          <button className="rounded-full bg-accent-soft px-3 py-1.5 text-[13px] font-semibold text-accent-deep">
            Chat
          </button>
        </div>

        <Link
          href="/trips"
          onClick={onDone}
          className="mt-3 block rounded-btn bg-ink py-3 text-center text-[15px] font-semibold text-white"
        >
          View in Trips
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-2">
      {/* date */}
      <p className="mb-2 text-[13px] font-semibold text-ink">Pick a date</p>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
        {days.map((d) => (
          <button
            key={d.iso}
            onClick={() => setDate(d.iso)}
            className={`flex w-14 shrink-0 flex-col items-center rounded-xl border py-2 ${
              date === d.iso ? "border-ink bg-ink text-white" : "border-hairline text-ink-2"
            }`}
          >
            <span className="text-[11px]">{d.dow}</span>
            <span className="text-[16px] font-bold leading-tight">{d.day}</span>
            <span className="text-[10px]">{d.month}</span>
          </button>
        ))}
      </div>

      {/* time — booking a real slot now, so "paid but can't book" can't happen */}
      <p className="mb-2 mt-4 text-[13px] font-semibold text-ink">Pick a time</p>
      <div className="flex gap-2">
        {slots.map((s) => (
          <button
            key={s}
            onClick={() => setTime(s)}
            className={`flex-1 rounded-xl border py-2.5 text-[13px] font-medium ${
              time === s ? "border-ink bg-ink text-white" : "border-hairline text-ink-2"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* party */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink">Guests</p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setParty((p) => Math.max(1, p - 1))}
            className="grid h-8 w-8 place-items-center rounded-full border border-hairline text-lg"
          >
            −
          </button>
          <span className="w-5 text-center text-[15px] font-semibold">{party}</span>
          <button
            onClick={() => setParty((p) => Math.min(8, p + 1))}
            className="grid h-8 w-8 place-items-center rounded-full border border-hairline text-lg"
          >
            +
          </button>
        </div>
      </div>

      {/* payment */}
      <p className="mb-2 mt-4 text-[13px] font-semibold text-ink">Pay with</p>
      <div className="flex gap-2">
        {PAY.map((p) => (
          <button
            key={p.id}
            onClick={() => setPay(p.id)}
            className={`flex-1 rounded-xl border px-2 py-2.5 text-[12px] font-medium ${
              pay === p.id ? "border-accent bg-accent-soft text-accent-deep" : "border-hairline text-ink-2"
            }`}
          >
            {p.glyph} {p.label}
          </button>
        ))}
      </div>

      {/* breakdown — all-in, no junk fees */}
      <div className="mt-4 space-y-1.5 border-t border-hairline pt-3 text-[14px]">
        <Row l={`$${exp.price} × ${party} ${party === 1 ? "guest" : "guests"}`} r={`$${total}`} />
        <Row l="Booking fee" r="$0" muted />
        <Row l="Total (all-in)" r={`$${total}`} bold />
      </div>

      <RefundBadge tier="green" className="mt-3" />

      <button
        onClick={() => {
          bookSolo(exp.id, date, time, party);
          setConfirmed(true);
        }}
        className="mt-4 w-full rounded-btn bg-accent py-3.5 text-[15px] font-semibold text-white active:scale-[0.99]"
      >
        Reserve · ${total}
      </button>
      <p className="mt-2 text-center text-[12px] text-muted">
        You won&apos;t be charged until the host confirms.
      </p>
    </div>
  );
}

function Row({ l, r, bold, muted }: { l: string; r: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold text-ink" : muted ? "text-muted" : "text-ink-2"}`}>
      <span>{l}</span>
      <span>{r}</span>
    </div>
  );
}
