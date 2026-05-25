"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Explore", icon: ExploreIcon },
  { href: "/groups", label: "Groups", icon: GroupsIcon },
  { href: "/concierge", label: "Concierge", icon: ConciergeIcon },
  { href: "/trips", label: "Trips", icon: TripsIcon },
  { href: "/profile", label: "Profile", icon: ProfileIcon },
];

export default function TabBar() {
  const path = usePathname();
  return (
    <nav className="shrink-0 border-t border-hairline bg-white/95 backdrop-blur px-2 pb-[env(safe-area-inset-bottom)]">
      <ul className="flex items-stretch justify-between">
        {TABS.map((t) => {
          const active =
            t.href === "/" ? path === "/" : path.startsWith(t.href);
          const Icon = t.icon;
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className="flex flex-col items-center gap-1 py-2.5"
              >
                <Icon active={active} />
                <span
                  className={`text-[10px] font-medium ${active ? "text-accent" : "text-muted"}`}
                >
                  {t.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function base(active: boolean) {
  return active ? "var(--color-accent)" : "none";
}
function stroke(active: boolean) {
  return active ? "var(--color-accent)" : "var(--color-muted)";
}

function ExploreIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={base(active)} stroke={stroke(active)} strokeWidth="2">
      <circle cx="11" cy="11" r="7" fill="none" />
      <path d="M21 21l-4.3-4.3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function GroupsIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke(active)} strokeWidth="2">
      <circle cx="9" cy="8" r="3.2" fill={base(active)} />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" strokeLinecap="round" />
      <path d="M15.5 14.2c2.4.2 4.5 1.9 4.5 4.8" strokeLinecap="round" />
    </svg>
  );
}
function ConciergeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke(active)} strokeWidth="2">
      <path d="M12 3l1.6 3.8L17.5 8l-3 2.7.8 4-3.3-2-3.3 2 .8-4-3-2.7 3.9-1.2L12 3z" fill={base(active)} strokeLinejoin="round" />
    </svg>
  );
}
function TripsIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke(active)} strokeWidth="2">
      <rect x="4" y="5" width="16" height="16" rx="3" fill={base(active)} />
      <path d="M8 3v4M16 3v4M4 10h16" strokeLinecap="round" />
    </svg>
  );
}
function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke(active)} strokeWidth="2">
      <circle cx="12" cy="8" r="3.6" fill={base(active)} />
      <path d="M5 20c0-3.4 3.1-6 7-6s7 2.6 7 6" strokeLinecap="round" />
    </svg>
  );
}
