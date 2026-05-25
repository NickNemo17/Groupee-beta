// Shared helpers for date/time slot picking (atomic book + reserve).
import { type DayPart } from "./concierge";

export function nextDays(n: number, from = new Date()): { iso: string; dow: string; day: number; month: string }[] {
  const out = [];
  for (let i = 1; i <= n; i++) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    out.push({
      iso: d.toISOString().slice(0, 10),
      dow: d.toLocaleDateString("en-US", { weekday: "short" }),
      day: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return out;
}

export function slotsFor(bestTime: DayPart | "any"): string[] {
  switch (bestTime) {
    case "morning":
      return ["8:00 AM", "9:30 AM", "11:00 AM"];
    case "afternoon":
      return ["12:30 PM", "2:00 PM", "4:00 PM"];
    case "evening":
      return ["5:30 PM", "7:00 PM", "8:30 PM"];
    default:
      return ["10:00 AM", "1:00 PM", "6:00 PM"];
  }
}

export function prettyDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
