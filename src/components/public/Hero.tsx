import React from 'react';
import { Sprout, AlertCircle, Users, HeartHandshake } from 'lucide-react';
import { PublicCampaignSummary } from '@/lib/types';

interface HeroProps {
  summary: PublicCampaignSummary;
}

export function Hero({ summary }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0a241b] via-[#0d3125] to-[#155e42] text-white py-20 sm:py-28 border-b border-[#155e42]/30">
      {/* Decorative organic background aura */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-[#22c55e] rounded-full filter blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-32 -left-32 w-[480px] h-[480px] bg-[#86efac] rounded-full filter blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#86efac] text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sprout className="w-4 h-4 text-[#22c55e]" />
            <span>Department of Commerce • SDG Cell</span>
          </div>

          {/* Campaign Heading in Plus Jakarta Sans */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-headline tracking-tight text-[#fcf9f3] leading-tight">
            One Department.
            <br />
            <span className="bg-gradient-to-r from-[#86efac] via-[#4ade80] to-[#22c55e] bg-clip-text text-transparent">
              17 Classes. Zero Hunger.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-200/90 max-w-2xl mx-auto font-normal leading-relaxed">
            1,360 Commerce students united across all 17 classes to eliminate hunger through physical food grains and monetary contributions.
          </p>

          {/* Unconfigured Campaign Indicator Banner */}
          {!summary.isConfigured && (
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm bg-amber-500/20 border border-amber-400/40 text-amber-200 px-4 py-2.5 rounded-2xl text-left shadow-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-300" />
                <span>
                  <strong>Campaign Setup Notice:</strong> Official departmental targets and conversion rules are currently being finalized by the SDG Cell. Current impact metrics will dynamically update once launched.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
