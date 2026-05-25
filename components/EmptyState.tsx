import Link from "next/link";
import { type ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  subtitle,
  cta,
}: {
  icon: string;
  title: string;
  subtitle?: ReactNode;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="mx-auto mt-12 max-w-xs text-center">
      <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-accent-soft text-2xl">
        {icon}
      </div>
      <p className="text-[16px] font-bold text-ink">{title}</p>
      {subtitle && <p className="mt-1 text-[13px] text-muted">{subtitle}</p>}
      {cta && (
        <Link
          href={cta.href}
          className="mt-4 inline-block rounded-btn bg-accent px-5 py-2.5 text-[14px] font-semibold text-white"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
