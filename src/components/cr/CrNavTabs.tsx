'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, PlusCircle, History, UserCheck } from 'lucide-react';

interface TabItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const TABS: TabItem[] = [
  { name: 'Class Overview', href: '/cr', icon: Users, exact: true },
  { name: 'Record Contribution', href: '/cr/contributions/new', icon: PlusCircle, exact: true },
  { name: 'Contribution History', href: '/cr/contributions', icon: History, exact: true },
  { name: 'Class Roster & Records', href: '/cr/students', icon: UserCheck },
];

export function CrNavTabs() {
  const pathname = usePathname();

  return (
    <div className="mt-6 border-b border-[#155e42]/60">
      <nav className="grid grid-cols-2 md:grid-cols-4 w-full -mb-px gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname?.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`group flex items-center justify-center gap-2 py-3 px-2 text-xs sm:text-sm font-semibold transition-all border-b-2 text-center rounded-t-xl ${
                isActive
                  ? 'border-[#22c55e] text-[#86efac] bg-[#155e42]/50 font-bold shadow-xs'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5 hover:border-white/10'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive
                    ? 'text-[#86efac]'
                    : 'text-gray-400 group-hover:text-gray-200'
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
