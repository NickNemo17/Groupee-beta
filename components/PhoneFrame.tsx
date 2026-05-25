"use client";

import { type ReactNode } from "react";

// Centers the app inside a phone bezel on desktop; full-bleed on a real phone.
// Height is capped to the viewport so the bottom (tab bar, floating controls)
// is never pushed below the fold on a short laptop screen.
export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-canvas sm:py-5">
      <div
        className="relative flex h-dvh w-full flex-col overflow-hidden bg-white sm:h-[min(880px,calc(100dvh-2.5rem))] sm:w-[400px] sm:rounded-[44px] sm:border-[10px] sm:border-black sm:shadow-pop"
        style={{ maxWidth: 400 }}
      >
        {/* notch */}
        <div className="absolute left-1/2 top-0 z-50 hidden h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-black sm:block" />
        {children}
      </div>
    </div>
  );
}
