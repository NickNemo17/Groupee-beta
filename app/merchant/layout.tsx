"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import Wordmark from "@/components/Wordmark";

const NAV = [
  { href: "/merchant", label: "Pipeline", icon: "▦" },
  { href: "/merchant/fleet", label: "Fleet", icon: "⛁" },
  { href: "/merchant/supply", label: "Supply graph", icon: "◎" },
  { href: "/merchant/impact", label: "Impact", icon: "📈" },
  { href: "/merchant/compliance", label: "Compliance", icon: "✓" },
];

export default function MerchantLayout({ children }: { children: ReactNode }) {
  const path = usePathname();
  return (
    <div className="flex min-h-dvh bg-canvas text-ink">
      {/* sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-hairline bg-white px-4 py-5 md:flex">
        <div className="px-2">
          <Wordmark sub="Partner Studio" />
          <p className="mt-1.5 text-[11px] text-muted">Supply-side agent console</p>
        </div>
        <nav className="mt-6 flex flex-col gap-1">
          {NAV.map((n) => {
            const active = n.href === "/merchant" ? path === "/merchant" : path.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] font-medium transition ${
                  active ? "bg-accent-soft text-accent-deep" : "text-ink-2 hover:bg-canvas"
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
      <main className="min-w-0 flex-1">
        {/* mobile top nav (sidebar is hidden below md) */}
        <div className="sticky top-0 z-30 border-b border-hairline bg-white/95 px-3 py-2 backdrop-blur md:hidden">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[13px] font-bold text-ink">
              <span className="text-accent-dark">Groupee</span> Partner Studio
            </span>
            <Link href="/" className="text-[12px] text-muted">← App</Link>
          </div>
          <nav className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {NAV.map((n) => {
              const active = n.href === "/merchant" ? path === "/merchant" : path.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium ${
                    active ? "bg-accent-soft text-accent-deep" : "bg-canvas text-ink-2"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
        {children}
      </main>
    </div>
  );
}
