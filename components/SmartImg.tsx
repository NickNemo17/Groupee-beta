"use client";

import { useState } from "react";
import { fallbackImg } from "@/lib/data";

// Plain <img> with a deterministic always-loads fallback so a broken
// Unsplash URL never leaves a blank card in the demo.
export default function SmartImg({
  src,
  seed,
  alt,
  className,
}: {
  src: string;
  seed: string;
  alt: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={errored ? fallbackImg(seed) : src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className={className}
    />
  );
}
