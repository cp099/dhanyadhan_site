import React from 'react';
import Link from 'next/link';
import { Sprout, Trophy, Users, Heart, ArrowDown, Sparkles, AlertCircle } from 'lucide-react';
import { PublicCampaignSummary } from '@/lib/types';
import { formatKg, formatCurrency } from '@/lib/utils';

interface HeroProps {
  summary: PublicCampaignSummary;
}

export function Hero({ summary }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0a241b] via-[#0f3a2c] to-[#155e42] text-white py-16 sm:py-24">
      {/* Decorative organic background aura */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#22c55e] rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#86efac] rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#86efac] text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
            <Sprout className="w-4 h-4 text-[#22c55e]" />
            Department of Commerce • SDG Cell
          </div>

          {/* Campaign Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#fbfaf7] mb-4">
            {summary.name || 'DHANYADHAN'}
          </h1>

          {/* Taglines */}
          <p className="text-xl sm:text-2xl font-medium text-[#86efac] mb-2">
            {summary.tagline || 'Every Grain Counts.'}
          </p>
          <p className="text-sm sm:text-base text-gray-300 mb-8 max-w-xl mx-auto">
            {summary.secondaryTagline || '17 Classes. One Goal.'} — Uniting over 1,360 Commerce students in a collective campaign for hunger alleviation and community nourishment.
          </p>

          {/* Unconfigured Campaign Indicator Banner (Specification Rule: Do not invent unconfirmed values) */}
          {!summary.isConfigured && (
            <div className="mb-10 inline-flex items-center gap-2 text-xs sm:text-sm bg-amber-500/20 border border-amber-400/40 text-amber-200 px-4 py-2.5 rounded-xl text-left">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-300" />
              <span>
                <strong>Campaign Setup Notice:</strong> Official departmental targets and conversion rules are currently being finalized by the SDG Cell. Current impact metrics will dynamically update once launched.
              </span>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <a
              href="#leaderboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#22c55e] text-[#0a241b] font-bold text-sm shadow-lg shadow-[#22c55e]/25 hover:bg-[#4ade80] transition-all hover:scale-105"
            >
              <Trophy className="w-4 h-4" />
              View 17-Class Leaderboard
            </a>
            <a
              href="#progress"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/20 transition-colors"
            >
              <ArrowDown className="w-4 h-4" />
              Department Impact
            </a>
          </div>

          {/* Dynamic Campaign Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-[#155e42]/60">
            <div className="bg-[#0a241b]/60 backdrop-blur-md p-4 rounded-2xl border border-[#155e42]/60">
              <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                Total Impact
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-[#86efac]">
                {formatKg(summary.totalImpactKg)}
              </span>
            </div>

            <div className="bg-[#0a241b]/60 backdrop-blur-md p-4 rounded-2xl border border-[#155e42]/60">
              <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                Department Target
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {summary.targetKg ? formatKg(summary.targetKg) : 'Pending SDG'}
              </span>
            </div>

            <div className="bg-[#0a241b]/60 backdrop-blur-md p-4 rounded-2xl border border-[#155e42]/60">
              <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                Contributing Students
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-[#86efac]">
                {summary.contributorCount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-[#0a241b]/60 backdrop-blur-md p-4 rounded-2xl border border-[#155e42]/60">
              <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                Contributions
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {summary.contributionCount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
