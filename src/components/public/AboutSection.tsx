'use client';

import React from 'react';
import { Sprout, Target, ShieldCheck, HeartHandshake, Wheat, Globe2 } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-20 py-20 bg-white border-t border-[#e6e2d8]">
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#155e42]/10 text-[#155e42] text-xs font-bold uppercase tracking-wider mb-3">
            <Sprout className="w-4 h-4 text-[#155e42]" />
            About Dhanyadhan & SDG Mission
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a241b] tracking-tight">
            Every Grain Counts. 17 Classes. One Goal.
          </h2>
          <p className="mt-3 text-[#526359] text-base leading-relaxed">
            Dhanyadhan is an institutional social-impact initiative by the Department of Commerce and the SDG Cell, mobilizing over 1,360 students across 17 classes to combat hunger and foster community nourishment.
          </p>
        </div>

        {/* 4 Concise Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Pillar 1 */}
          <div className="bg-[#fbfaf7] p-6 rounded-2xl border border-[#e6e2d8] hover:border-[#155e42]/30 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#155e42]/10 flex items-center justify-center text-[#155e42]">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#0a241b]">
              One Unified Target
            </h3>
            <p className="text-xs text-[#526359] leading-relaxed">
              All 17 Commerce classes pool contributions toward a single departmental impact goal. Every grain and rupee moves the department forward together.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-[#fbfaf7] p-6 rounded-2xl border border-[#e6e2d8] hover:border-[#155e42]/30 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
              <Wheat className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#0a241b]">
              Dual Contribution Model
            </h3>
            <p className="text-xs text-[#526359] leading-relaxed">
              Students contribute physical food grains or monetary support. Server-calculated Equivalent Impact KG balances both forms fairly.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-[#fbfaf7] p-6 rounded-2xl border border-[#e6e2d8] hover:border-[#155e42]/30 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-[#16a34a]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#0a241b]">
              Strict Public Privacy
            </h3>
            <p className="text-xs text-[#526359] leading-relaxed">
              Donations are an act of community solidarity. Individual donation amounts and weights are private; the public only sees verified student names and ranks.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-[#fbfaf7] p-6 rounded-2xl border border-[#e6e2d8] hover:border-[#155e42]/30 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-700">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#0a241b]">
              UN SDG Alignment
            </h3>
            <p className="text-xs text-[#526359] leading-relaxed">
              Directly contributes to <strong>SDG 2: Zero Hunger</strong> and <strong>SDG 12: Responsible Consumption</strong> through mindful student stewardship.
            </p>
          </div>
        </div>

        {/* Concise SDG Banner */}
        <div className="bg-[#0a241b] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs text-[#86efac] font-bold uppercase tracking-wider block mb-1">
              United Nations Global Goals
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Direct Impact on Zero Hunger & Responsible Giving
            </h3>
            <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
              All collected grain is consolidated by the SDG Cell and distributed to vetted community feeding centers and families in need.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">Goal 2</span>
              <span className="text-xs font-bold text-white">Zero Hunger</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-center">
              <span className="text-[10px] uppercase font-bold text-[#86efac] block">Goal 12</span>
              <span className="text-xs font-bold text-white">Responsible Action</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
