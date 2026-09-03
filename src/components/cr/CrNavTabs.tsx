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
    <div className="mt-3 border-t border-[#f0ede6]">
      <nav className="flex space-x-1 sm:space-x-8 overflow-x-auto no-scrollbar -mb-px">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname?.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`group inline-flex items-center gap-2 py-3 px-1 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-[#155e42] text-[#155e42] font-extrabold'
                  : 'border-transparent text-[#526359] hover:text-[#0a241b] hover:border-gray-300'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive
                    ? 'text-[#155e42]'
                    : 'text-gray-400 group-hover:text-[#0a241b]'
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
