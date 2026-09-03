'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sprout, Menu, X, Shield, Users, BarChart3 } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCR = pathname?.startsWith('/cr');
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 bg-[#0a241b]/95 backdrop-blur-md border-b border-[#155e42]/50 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22c55e] to-[#155e42] flex items-center justify-center shadow-md shadow-[#22c55e]/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wider text-[#fbfaf7] block leading-none">
                DHANYADHAN
              </span>
              <span className="text-xs text-[#86efac] tracking-wide font-medium">
                SDG Cell • Department of Commerce
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'bg-[#155e42] text-white'
                  : 'text-gray-300 hover:text-white hover:bg-[#155e42]/40'
              }`}
            >
              Leaderboard
            </Link>
            <Link
              href="/#progress"
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#155e42]/40 transition-colors"
            >
              Campaign Progress
            </Link>
            <Link
              href="/about"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/about'
                  ? 'bg-[#155e42] text-white'
                  : 'text-gray-300 hover:text-white hover:bg-[#155e42]/40'
              }`}
            >
              About & SDG Mission
            </Link>
          </nav>

          {/* Desktop Auth / Console Shortcuts */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/cr"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isCR
                  ? 'bg-[#22c55e] text-[#0a241b] border-[#22c55e]'
                  : 'border-[#22c55e]/40 text-[#86efac] hover:bg-[#22c55e]/10'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              CR Console
            </Link>
            <Link
              href="/admin"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isAdmin
                  ? 'bg-amber-400 text-amber-950 border-amber-400'
                  : 'border-amber-400/40 text-amber-300 hover:bg-amber-400/10'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              SDG Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#155e42]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d3125] border-b border-[#155e42] px-4 pt-3 pb-5 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:bg-[#155e42]"
          >
            Leaderboard
          </Link>
          <Link
            href="/#progress"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:bg-[#155e42]"
          >
            Campaign Progress
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:bg-[#155e42]"
          >
            About & SDG Mission
          </Link>
          <div className="pt-3 border-t border-[#155e42] flex flex-col space-y-2">
            <Link
              href="/cr"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#155e42] text-[#86efac] font-semibold text-sm"
            >
              <Users className="w-4 h-4" />
              CR Console (Class Access)
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 font-semibold text-sm"
            >
              <Shield className="w-4 h-4" />
              SDG Admin Console
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
