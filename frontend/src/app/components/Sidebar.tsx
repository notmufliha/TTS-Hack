"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { icons } from "./ui";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: icons.dashboard },
  { href: "/referrals", label: "Referral queue", icon: icons.queue },
  { href: "/reports", label: "Reports", icon: icons.report },
  { href: "/records", label: "Records", icon: icons.records },
  { href: "/nok", label: "NOK counselling", icon: icons.family },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const isActive = useIsActive();
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-700 text-white">
          <icons.queue className="h-4.5 w-4.5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">ICH Referral Triage</p>
          <p className="text-xs text-slate-500">Patient Service Office</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ href, label, icon: NavIcon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive(href) ? "bg-sky-50 text-sky-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <NavIcon className="h-4.5 w-4.5" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="m-3 flex gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        <icons.shield className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <p>Demo data only. Reads the mock EPIC database on demand and keeps no copy.</p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const isActive = useIsActive();
  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-white md:hidden">
      <div className="flex h-14 items-center gap-2 px-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-700 text-white">
          <icons.queue className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold text-slate-900">ICH Referral Triage</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
              isActive(href) ? "bg-sky-50 text-sky-800" : "text-slate-600"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
