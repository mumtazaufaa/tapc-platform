"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, LayoutDashboard, Nfc, Settings, Users } from "lucide-react";

const items = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, ready: true },
  { label: "NFC Management", href: "/dashboard/nfc", icon: Nfc, ready: true },
  { label: "Customers", href: "/dashboard/customers", icon: Users, ready: true },
  { label: "Link History", href: "/dashboard/history", icon: History, ready: true },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, ready: true },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 px-3">
      {items.map(({ label, href, icon: Icon, ready }) => {
        if (!ready) {
          return (
            <div
              key={label}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sage-500"
            >
              <Icon size={18} /> {label}
              <span className="ml-auto rounded-full bg-forest-900 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                segera
              </span>
            </div>
          );
        }
        const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={label}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              active
                ? "bg-forest-800 font-medium text-white"
                : "text-sage-300 hover:bg-forest-900 hover:text-white"
            }`}
          >
            <Icon size={18} /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
