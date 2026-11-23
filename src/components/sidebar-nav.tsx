"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, LayoutDashboard, Nfc, Settings, Users } from "lucide-react";

const items = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "NFC Management", href: "/dashboard/nfc", icon: Nfc },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Link History", href: "/dashboard/history", icon: History },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 px-3">
      {items.map(({ label, href, icon: Icon }) => {
        const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              active
                ? "bg-navy-800 font-medium text-white shadow-[inset_3px_0_0_var(--color-petal-500)]"
                : "text-petal-300 hover:bg-navy-900 hover:text-white"
            }`}
          >
            <Icon size={18} /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
