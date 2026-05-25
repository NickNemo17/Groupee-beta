"use client";

import { useGroupee } from "@/lib/store";

export default function HeartButton({
  id,
  className = "",
}: {
  id: string;
  className?: string;
}) {
  const { isSaved, toggleWishlist } = useGroupee();
  const saved = isSaved(id);
  return (
    <button
      aria-label={saved ? "Remove from saved" : "Save"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(id);
      }}
      className={`grid place-items-center rounded-full transition active:scale-90 ${className}`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={saved ? "var(--color-accent)" : "rgba(0,0,0,0.35)"}
        stroke="white"
        strokeWidth="2"
      >
        <path d="M12 21s-7.5-4.6-10-9.3C.3 8 2 4.5 5.3 4.5c2 0 3.4 1.2 4.2 2.4C10.3 5.7 11.7 4.5 13.7 4.5 17 4.5 18.7 8 17 11.7 14.5 16.4 12 21 12 21z" />
      </svg>
    </button>
  );
}
