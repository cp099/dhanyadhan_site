import React from 'react';
import Link from 'next/link';
import { Sprout, ShieldCheck, HeartHandshake } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0a241b] text-white border-t border-[#155e42]/40 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand & Mission */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#22c55e] flex items-center justify-center">
                <Sprout className="w-5 h-5 text-[#0a241b]" />
              </div>
              <span className="font-bold text-lg tracking-wider text-[#fbfaf7]">DHANYADHAN</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              An institutional social-impact campaign uniting 17 Commerce classes to eliminate hunger and support sustainable community nourishment.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#86efac]">
              <HeartHandshake className="w-4 h-4" />
              <span>17 Classes • One Departmental Goal</span>
            </div>
          </div>

          {/* Quick Links & Portals */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#86efac] mb-4">
              Navigation & Portals
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Department Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  SDG Mission & Campaign Rules
                </Link>
              </li>
              <li>
                <Link href="/cr" className="hover:text-white transition-colors">
                  Class Representative (CR) Portal
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  SDG Cell Master Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy Principle Callout */}
          <div className="bg-[#0d3125] p-5 rounded-2xl border border-[#155e42]/50">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Public Privacy Guarantee</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Dhanyadhan celebrates collective class impact while rigorously protecting student financial privacy. Individual contribution amounts and grain quantities are never disclosed to the public.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#155e42]/40 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Department of Commerce • SDG Cell. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
