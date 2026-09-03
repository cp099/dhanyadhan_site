'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  History,
  UserPlus,
  FileSpreadsheet,
} from 'lucide-react';

interface TabItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const TABS: TabItem[] = [
  { name: 'Command Center', href: '/admin', icon: LayoutDashboard, exact: true },
  { name: '17 Classes', href: '/admin/classes', icon: GraduationCap },
  { name: 'All Contributions', href: '/admin/contributions', icon: History },
  { name: 'CR Accounts', href: '/admin/cr-management', icon: UserPlus },
  { name: 'Reports & CSV', href: '/admin/reports', icon: FileSpreadsheet },
];

export function AdminNavTabs() {
  const pathname = usePathname();

  return (
    <div className="mt-3 border-t border-[#f0ede6]">
      <nav className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 w-full -mb-px">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname?.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`group flex items-center justify-center gap-2 py-3 px-2 text-xs sm:text-sm font-semibold transition-all border-b-2 text-center ${
                isActive
                  ? 'border-[#155e42] text-[#155e42] font-extrabold bg-[#155e42]/5'
                  : 'border-transparent text-[#526359] hover:text-[#0a241b] hover:border-gray-300 hover:bg-black/[0.02]'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive
                    ? 'text-[#155e42]'
                    : 'text-gray-400 group-hover:text-[#0a241b]'
                }`}
              />
              <span className="truncate">{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
