import React from 'react';
import { PublicCampaignSummary } from '@/lib/types';
import { formatKg } from '@/lib/utils';
import { Target, CheckCircle2, Circle, Wheat, Flame } from 'lucide-react';

interface ProgressSectionProps {
  summary: PublicCampaignSummary;
}

export function ProgressSection({ summary }: ProgressSectionProps) {
  const percentage = summary.progressPercentage || 0;
  const target = summary.targetKg || 0;
  const current = summary.totalImpactKg || 0;
  const remaining = Math.max(0, target - current);

  return (
    <section id="progress" className="py-16 bg-[#f4f1eb] border-y border-[#e6e2d8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#155e42]/10 text-[#155e42] text-xs font-bold uppercase tracking-wider mb-3">
            <Target className="w-4 h-4" />
            Department Collective Target
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a241b]">
            One Goal. 17 Classes United.
          </h2>
          <p className="mt-3 text-[#526359] text-base">
            Every contribution across all 17 classes propels the Department of Commerce towards our common social-impact target.
          </p>
        </div>

        {/* Main Department Progress Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#e6e2d8] max-w-4xl mx-auto mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-4 gap-4">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-[#526359]">
                Achieved Impact
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#155e42]">
                  {formatKg(current)}
                </span>
                <span className="text-lg text-[#526359] font-medium">
                  of {target > 0 ? formatKg(target) : 'Target TBD'}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#526359] block">
                Progress
              </span>
              <span className="text-3xl font-black text-[#16a34a]">
                {percentage}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-5 bg-[#e6e2d8] rounded-full overflow-hidden p-1 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#155e42] via-[#22c55e] to-[#4ade80] rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${Math.min(100, Math.max(2, percentage))}%` }}
            ></div>
          </div>

          {/* Remaining KG / Status Footnote */}
          <div className="mt-4 flex flex-wrap justify-between items-center text-xs text-[#526359] pt-3 border-t border-[#f4f1eb]">
            <span>
              {target > 0 ? (
                remaining > 0 ? (
                  <><strong>{formatKg(remaining)}</strong> needed to achieve departmental goal.</>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Department Target Accomplished!
                  </span>
                )
              ) : (
                'Final target will be announced by the SDG Cell.'
              )}
            </span>
            <span>
              {summary.contributorCount.toLocaleString('en-IN')} student changemakers
            </span>
          </div>

          {/* Milestones Tracker if configured */}
          {summary.milestones && summary.milestones.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#e6e2d8]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#526359] mb-4 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                Campaign Milestones
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {summary.milestones.map((m) => {
                  const reached = current >= m;
                  return (
                    <div
                      key={m}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        reached
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                          : 'bg-[#fbfaf7] border-[#e6e2d8] text-[#526359]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        {reached ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-xs">{reached ? 'Reached' : 'Milestone'}</span>
                      </div>
                      <span className="text-base font-bold">{formatKg(m)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Accepted Food Grains Guide */}
        {summary.acceptedGrains && summary.acceptedGrains.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-[#0a241b] mb-4 text-center flex items-center justify-center gap-2">
              <Wheat className="w-5 h-5 text-[#155e42]" />
              Accepted Food Grains
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {summary.acceptedGrains.map((g) => (
                <div
                  key={g.id}
                  className="bg-white p-4 rounded-2xl border border-[#e6e2d8] text-center shadow-xs hover:border-[#155e42] transition-colors"
                >
                  <div className="w-10 h-10 mx-auto rounded-xl bg-[#155e42]/10 flex items-center justify-center mb-2">
                    <Wheat className="w-5 h-5 text-[#155e42]" />
                  </div>
                  <h4 className="font-semibold text-sm text-[#0a241b]">{g.name}</h4>
                  <span className="text-xs text-[#526359] block mt-0.5">Physical Grain</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
