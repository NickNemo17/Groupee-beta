"use client";

import { type ReactNode } from "react";
import { GroupeeProvider } from "@/lib/store";
import PhoneFrame from "./PhoneFrame";
import TabBar from "./TabBar";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <GroupeeProvider>
      <PhoneFrame>
        <main className="flex-1 overflow-y-auto no-scrollbar overscroll-contain">
          {children}
        </main>
        <TabBar />
      </PhoneFrame>
    </GroupeeProvider>
  );
}
