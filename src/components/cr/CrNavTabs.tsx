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
    <nav className="flex space-x-2 mt-4 overflow-x-auto pb-1 text-sm font-medium">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname?.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap text-xs sm:text-sm ${
              isActive
                ? 'bg-[#22c55e] text-[#0a241b] font-bold shadow-sm border border-[#22c55e] scale-[1.02]'
                : 'bg-white/10 hover:bg-white/20 text-white border border-transparent'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-[#0a241b]' : 'text-[#86efac]'}`} />
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
