'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  History,
  Settings,
  UserPlus,
  FileSpreadsheet,
  ScrollText,
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
  { name: 'Student Rosters', href: '/admin/students', icon: Users },
  { name: 'All Contributions', href: '/admin/contributions', icon: History },
  { name: 'Campaign & Rules', href: '/admin/campaign', icon: Settings },
  { name: 'CR Accounts', href: '/admin/cr-management', icon: UserPlus },
  { name: 'Reports & CSV', href: '/admin/reports', icon: FileSpreadsheet },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText },
];

export function AdminNavTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-1 sm:space-x-2 mt-5 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname?.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isActive
                ? 'bg-amber-400 text-amber-950 font-bold shadow-sm border border-amber-300 scale-[1.02]'
                : 'bg-white/10 hover:bg-white/20 text-gray-200 border border-transparent'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-amber-950' : 'text-gray-300'}`} />
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
