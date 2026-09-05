'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, History, Users } from 'lucide-react';

interface TabItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const TABS: TabItem[] = [
  { name: 'Faculty Overview', href: '/faculty', icon: LayoutDashboard, exact: true },
  { name: 'Record Contribution', href: '/faculty/contributions/new', icon: PlusCircle, exact: true },
  { name: 'Contribution History', href: '/faculty/contributions', icon: History, exact: true },
  { name: 'Faculty Directory', href: '/faculty/roster', icon: Users },
];

export function FacultyNavTabs() {
  const pathname = usePathname();

  return (
    <div className="mt-3 border-t border-[#f0ede6]">
      <nav className="grid grid-cols-2 md:grid-cols-4 w-full -mb-px">
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
                  ? 'border-blue-700 text-blue-900 font-extrabold bg-blue-50/50'
                  : 'border-transparent text-[#526359] hover:text-[#0a241b] hover:border-gray-300 hover:bg-black/[0.02]'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-[#0a241b]'
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
