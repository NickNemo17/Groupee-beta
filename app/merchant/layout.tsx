"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

const NAV = [
  { href: "/merchant", label: "Pipeline", icon: "▦" },
  { href: "/merchant/supply", label: "Supply graph", icon: "◎" },
  { href: "/merchant/compliance", label: "Compliance", icon: "✓" },
];

export default function MerchantLayout({ children }: { children: ReactNode }) {
  const path = usePathname();
  return (
    <div className="flex min-h-dvh bg-canvas text-ink">
      {/* sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-hairline bg-white px-4 py-5 md:flex">
        <div className="px-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-accent-dark">Groupee</p>
          <p className="text-[15px] font-bold leading-tight">Partner Studio</p>
          <p className="mt-0.5 text-[11px] text-muted">Supply-side agent console</p>
        </div>
        <nav className="mt-6 flex flex-col gap-1">
          {NAV.map((n) => {
            const active = n.href === "/merchant" ? path === "/merchant" : path.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] font-medium transition ${
                  active ? "bg-accent-soft text-accent-dark" : "text-ink-2 hover:bg-canvas"
                }`}
              >
                <span className="w-4 text-center">{n.icon}</span>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-xl bg-canvas p-3 text-[11px] leading-relaxed text-muted">
          Agent fleet active.<br />
          <span className="font-semibold text-ink-2">~10,000 outreaches/wk</span> vs a human BDR&apos;s ~100.
        </div>
        <Link href="/" className="mt-3 px-2 text-[12px] text-muted hover:text-ink-2">
          ← Consumer app
        </Link>
      </aside>

      {/* main */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
