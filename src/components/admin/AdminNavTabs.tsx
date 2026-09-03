'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  History,
  Settings,
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
  { name: 'Campaign & Rules', href: '/admin/campaign', icon: Settings },
  { name: 'CR Accounts', href: '/admin/cr-management', icon: UserPlus },
  { name: 'Reports & CSV', href: '/admin/reports', icon: FileSpreadsheet },
];

export function AdminNavTabs() {
  const pathname = usePathname();

  return (
    <div className="mt-6 border-b border-[#155e42]/60">
      <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar -mb-px">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname?.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`group inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap rounded-t-xl ${
                isActive
                  ? 'border-[#86efac] text-[#86efac] bg-[#155e42]/40 font-bold shadow-xs'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5 hover:border-white/20'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive
                    ? 'text-[#86efac]'
                    : 'text-gray-400 group-hover:text-gray-200'
                }`}
              />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
