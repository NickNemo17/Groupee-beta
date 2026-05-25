"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { GroupeeProvider } from "@/lib/store";
import { MerchantProvider } from "@/lib/merchantStore";
import PhoneFrame from "./PhoneFrame";
import TabBar from "./TabBar";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The merchant ops console is a full-width desktop tool, not the phone frame.
  const isMerchant = pathname?.startsWith("/merchant");

  return (
    <GroupeeProvider>
      <MerchantProvider>
        {isMerchant ? (
          <div className="min-h-dvh w-full bg-canvas">{children}</div>
        ) : (
          <PhoneFrame>
            <main className="flex-1 overflow-y-auto no-scrollbar overscroll-contain">
              {children}
            </main>
            <TabBar />
          </PhoneFrame>
        )}
      </MerchantProvider>
    </GroupeeProvider>
  );
}
