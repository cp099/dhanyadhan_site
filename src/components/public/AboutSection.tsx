'use client';

import React from 'react';
import {
  Target,
  ShieldCheck,
  Wheat,
  Globe2,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-20 py-16 bg-[#fbfaf7] border-t border-[#e6e2d8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#e6e2d8] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column (5 Cols): Mission Narrative & UN SDG Badges */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#155e42]/10 text-[#155e42] text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#155e42]" />
                  SDG Impact Initiative
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-[#0a241b] tracking-tight leading-tight">
                  Every Grain Counts.
                  <br />
                  <span className="text-[#155e42]">17 Classes. One Goal.</span>
                </h2>

                <p className="text-xs sm:text-sm text-[#526359] leading-relaxed">
                  <strong>Dhanyadhan</strong> unites over 1,360 students from 17 Commerce cohorts
                  under a single collective social-impact campaign. Every physical food grain and
                  monetary contribution directly empowers community nourishment.
                </p>
              </div>

              {/* UN SDG Official Badges */}
              <div className="pt-2 border-t border-[#f0ede6] space-y-2.5">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  United Nations Sustainable Development Goals
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold shadow-2xs">
                    <span className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">
                      2
                    </span>
                    <span>Zero Hunger</span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold shadow-2xs">
                    <span className="w-5 h-5 rounded-md bg-[#155e42] text-white flex items-center justify-center text-[10px] font-black">
                      12
                    </span>
                    <span>Responsible Consumption</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (7 Cols): 4 Refined Pillars (Minimal, Uncluttered Grid) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pillar 1 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#fbfaf7] border border-[#e6e2d8] space-y-2 hover:border-[#155e42]/30 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-[#155e42]/10 flex items-center justify-center text-[#155e42]">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#0a241b]">One Departmental Target</h3>
                <p className="text-xs text-[#526359] leading-relaxed">
                  All 17 classes pool contributions toward an institutional collective milestone, driving healthy solidarity.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#fbfaf7] border border-[#e6e2d8] space-y-2 hover:border-[#155e42]/30 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700">
                  <Wheat className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#0a241b]">Dual Contribution Model</h3>
                <p className="text-xs text-[#526359] leading-relaxed">
                  Students contribute physical grains or monetary support. Server conversion calculates equitable impact.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#fbfaf7] border border-[#e6e2d8] space-y-2 hover:border-[#155e42]/30 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-[#155e42]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#0a241b]">Strict Donor Privacy</h3>
                <p className="text-xs text-[#526359] leading-relaxed">
                  Individual rupee amounts and grain weights are private. Public rankings display student names and ranks only.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#fbfaf7] border border-[#e6e2d8] space-y-2 hover:border-[#155e42]/30 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-700">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#0a241b]">Direct Community Delivery</h3>
                <p className="text-xs text-[#526359] leading-relaxed">
                  All collected grains are consolidated by the SDG Cell and disbursed to verified local community feeding centers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
