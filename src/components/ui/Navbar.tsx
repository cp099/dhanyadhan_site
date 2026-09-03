'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sprout, Menu, X, Shield, Users, LogOut, User } from 'lucide-react';
import { UserProfile } from '@/lib/types';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Check user session
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (res.ok && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setLoadingUser(false);
      }
    }

    checkSession();
  }, [pathname]);

  async function handleLogout() {
    try {
      await fetch('/api/auth/session', { method: 'POST' });
      setCurrentUser(null);
      router.push('/');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    }
  }

  const isCR = currentUser?.role === 'class_admin';
  const isAdmin = currentUser?.role === 'sdg_admin';

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
              href="/#progress"
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#155e42]/40 transition-colors"
            >
              Campaign Progress
            </Link>
            <Link
              href="/#leaderboard"
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#155e42]/40 transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/#about"
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#155e42]/40 transition-colors"
            >
              About & SDG Mission
            </Link>
          </nav>

          {/* Single Unified Authentication Portal */}
          <div className="hidden md:flex items-center space-x-3">
            {!loadingUser && currentUser ? (
              <div className="flex items-center space-x-2">
                <Link
                  href={isAdmin ? '/admin' : '/cr'}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    isAdmin
                      ? 'bg-amber-400 text-amber-950 border-amber-400 hover:bg-amber-300'
                      : 'bg-[#22c55e] text-[#0a241b] border-[#22c55e] hover:bg-[#4ade80]'
                  }`}
                >
                  {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                  <span>{isAdmin ? 'SDG Admin Console' : `CR Console (${currentUser.classId})`}</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
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
            href="/#progress"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:bg-[#155e42]"
          >
            Campaign Progress
          </Link>
          <Link
            href="/#leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:bg-[#155e42]"
          >
            Leaderboard
          </Link>
          <Link
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:bg-[#155e42]"
          >
            About & SDG Mission
          </Link>

          <div className="pt-3 border-t border-[#155e42]">
            {currentUser ? (
              <div className="space-y-2">
                <Link
                  href={isAdmin ? '/admin' : '/cr'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#22c55e] text-[#0a241b] font-bold text-sm"
                >
                  {isAdmin ? <Shield className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  <span>{isAdmin ? 'SDG Admin Console' : `CR Console (${currentUser.classId})`}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-gray-300 font-semibold text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
