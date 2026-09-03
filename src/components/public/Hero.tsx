import React from 'react';
import { Sprout, AlertCircle } from 'lucide-react';
import { PublicCampaignSummary } from '@/lib/types';

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
        </div>
      </div>
    </section>
  );
}
