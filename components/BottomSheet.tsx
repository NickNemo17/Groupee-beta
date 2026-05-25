"use client";

import { type ReactNode, useEffect } from "react";

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[2000] flex flex-col justify-end">
      <button
        aria-label="Close"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-black/40"
      />
      <div className="animate-slide-up relative max-h-[88%] overflow-y-auto no-scrollbar rounded-t-3xl bg-white pb-6">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-5 pb-2 pt-4">
          <h2 className="text-[17px] font-bold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-canvas text-ink"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="px-5">{children}</div>
      </div>
    </div>
  );
}
