import React from 'react';
import { PublicCampaignSummary } from '@/lib/types';
import { formatKg, formatCurrency } from '@/lib/utils';
import { Target, CheckCircle2, Circle, Wheat, Coins, Users, Flame, Sparkles } from 'lucide-react';

interface ProgressSectionProps {
  summary: PublicCampaignSummary;
}

export function ProgressSection({ summary }: ProgressSectionProps) {
  const percentage = summary.progressPercentage || 0;
  const target = summary.targetKg || 0;
  const current = summary.totalImpactKg || 0;
  const remaining = Math.max(0, target - current);

  return (
    <section id="progress" className="scroll-mt-20 py-16 sm:py-20 bg-[#f4f1eb]/80 border-b border-[#e6e2d8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#155e42]/10 text-[#155e42] text-xs font-bold uppercase tracking-wider mb-3">
            <Target className="w-3.5 h-3.5" />
            <span>Department Collective Target</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-headline text-[#0a241b] tracking-tight">
            One Goal. 17 Classes United.
          </h2>
          <p className="mt-2.5 text-[#526359] text-sm sm:text-base leading-relaxed">
            Every physical food grain and rupee collected across all 17 commerce classes moves our department closer to the institutional milestone.
          </p>
        </div>

        {/* Main Department Progress Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 card-shadow border border-[#e6e2d8] max-w-5xl mx-auto space-y-8">
          {/* Top Metric Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#526359] block">
                Achieved Equivalent Impact
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl sm:text-5xl font-black font-headline text-[#155e42] tracking-tight">
                  {formatKg(current)}
                </span>
                <span className="text-base sm:text-lg text-[#526359] font-medium">
                  of {target > 0 ? formatKg(target) : 'Target TBD'}
                </span>
              </div>
              {summary.facultyTotalEquivalentKg && summary.facultyTotalEquivalentKg > 0 ? (
                <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-[#526359]">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Classes: <strong>{formatKg(Math.max(0, current - summary.facultyTotalEquivalentKg))}</strong>
                  </span>
                  <span>+</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    Faculty: <strong>{formatKg(summary.facultyTotalEquivalentKg)}</strong>
                  </span>
                </div>
              ) : null}
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-[#526359] block">
                Target Progress
              </span>
              <span className="text-3xl sm:text-4xl font-black font-headline text-[#16a34a]">
                {percentage}%
              </span>
            </div>
          </div>

          {/* High-Definition Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-4 bg-[#f0eee8] rounded-full overflow-hidden p-0.5 border border-[#e6e2d8]">
              <div
                className="h-full bg-gradient-to-r from-[#155e42] via-[#22c55e] to-[#4ade80] rounded-full transition-all duration-1000 ease-out shadow-xs"
                style={{ width: `${Math.min(100, Math.max(2, percentage))}%` }}
              />
            </div>

            <div className="flex flex-wrap justify-between items-center text-xs text-[#526359] pt-1">
              <span>
                {target > 0 ? (
                  remaining > 0 ? (
                    <><strong>{formatKg(remaining)}</strong> remaining to achieve target.</>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Department Target Accomplished!
                    </span>
                  )
                ) : (
                  'Target is being finalized by SDG Cell.'
                )}
              </span>
              <span className="font-semibold text-[#0a241b] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#155e42]" />
                {summary.contributorCount.toLocaleString('en-IN')}{' '}
                {summary.facultyTotalEquivalentKg && summary.facultyTotalEquivalentKg > 0
                  ? 'contributors (classes + faculty)'
                  : 'student changemakers'}
              </span>
            </div>
          </div>

          {/* Granular Breakdown Tiles (Stitch Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#f4f1eb]">
            <div className="p-4 rounded-2xl bg-[#fcf9f3] border border-[#e6e2d8] flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#155e42]/10 flex items-center justify-center text-[#155e42] flex-shrink-0">
                <Wheat className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-[#526359] block">Physical Food Grains</span>
                <strong className="text-base font-black font-headline text-[#0a241b] block">
                  {formatKg(summary.totalGrainKg || 0)}
                </strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#fcf9f3] border border-[#e6e2d8] flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700 flex-shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-[#526359] block">Monetary Pool</span>
                <strong className="text-base font-black font-headline text-[#0a241b] block">
                  {formatCurrency(summary.totalMoney || 0)}
                </strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#fcf9f3] border border-[#e6e2d8] flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-700 flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-[#526359] block">Active Cohorts</span>
                <strong className="text-base font-black font-headline text-[#0a241b] block">
                  {summary.facultyTotalEquivalentKg && summary.facultyTotalEquivalentKg > 0
                    ? '17 Classes + Faculty'
                    : '17 Classes United'}
                </strong>
              </div>
            </div>
          </div>

          {/* Milestones Tracker if configured */}
          {summary.milestones && summary.milestones.length > 0 && (
            <div className="pt-6 border-t border-[#e6e2d8]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#526359] flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Campaign Milestone Badges</span>
                </h4>
                <span className="text-xs text-gray-400">Automatic Server Tiers</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {summary.milestones.map((m) => {
                  const reached = current >= m;
                  return (
                    <div
                      key={m}
                      className={`p-3.5 rounded-2xl border text-center transition-all ${
                        reached
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                          : 'bg-[#fcf9f3] border-[#e6e2d8] text-[#526359]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        {reached ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-xs font-semibold">{reached ? 'Unlocked' : 'Locked'}</span>
                      </div>
                      <span className="text-base font-black font-headline block">{formatKg(m)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
