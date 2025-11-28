"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Members", href: "/members" },
  { label: "Billing", href: "#" },
  { label: "Marketing", href: "#" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-52 flex-col bg-slate-900 text-white py-6">
      <div className="px-6 mb-8 text-lg font-semibold tracking-wide">
        Fit Center
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            (item.href === "/" && pathname === "/") || pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-slate-700 text-white"
                  : "text-slate-200 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
