import Link from 'next/link';
import {
  getPublicCampaignSummary,
  getCampaignConfig,
  getAllClasses,
  getAllContributions,
} from '@/lib/firebase/admin';
import { formatKg, formatCurrency, formatDate } from '@/lib/utils';
import {
  Trophy,
  Users,
  Wheat,
  Coins,
  Settings,
  GraduationCap,
  PlusCircle,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Database,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [summary, config, classes, contributions] = await Promise.all([
    getPublicCampaignSummary(),
    getCampaignConfig(),
    getAllClasses(),
    getAllContributions(),
  ]);

  const sortedClasses = [...classes].sort((a, b) => a.currentRank - b.currentRank);

  return (
    <div className="space-y-8">
      {/* Configuration Status Banner */}
      {!config.isConfigured && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-amber-950">
                Campaign Configuration Incomplete
              </h3>
              <p className="text-xs text-amber-800 mt-1">
                Official campaign parameters (Target KG, Money-to-KG conversion rate, and accepted grains) have not been finalized. Please configure them before public launch.
              </p>
            </div>
          </div>
          <Link
            href="/admin/campaign"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors flex-shrink-0"
          >
            <Settings className="w-4 h-4" />
            Configure Campaign
          </Link>
        </div>
      )}

      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs">
        <div>
          <h2 className="text-2xl font-black text-[#0a241b]">
            Department Command Center
          </h2>
          <p className="text-xs text-[#526359] mt-1">
            Master oversight for all 17 Department of Commerce classes and campaign metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/classes"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e6e2d8] text-xs font-bold text-[#155e42] hover:bg-[#fbfaf7] transition-colors"
          >
            <GraduationCap className="w-4 h-4" />
            17 Classes Directory
          </Link>
          <Link
            href="/admin/campaign"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#155e42] text-white text-xs font-bold hover:bg-[#0a241b] transition-colors shadow-xs"
          >
            <Settings className="w-4 h-4 text-[#86efac]" />
            Campaign Settings
          </Link>
        </div>
      </div>

      {/* Department KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Impact */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] shadow-xs">
          <div className="flex items-center justify-between text-[#526359] text-xs font-semibold uppercase mb-2">
            <span>Total Department Impact</span>
            <TrendingUp className="w-4 h-4 text-[#155e42]" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#155e42]">
            {formatKg(summary.totalImpactKg)}
          </span>
          <span className="text-xs text-[#526359] block mt-1">
            Target: {summary.targetKg ? formatKg(summary.targetKg) : 'Not configured'}
          </span>
        </div>

        {/* Progress Percentage */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] shadow-xs">
          <div className="flex items-center justify-between text-[#526359] text-xs font-semibold uppercase mb-2">
            <span>Overall Progress</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#16a34a]">
            {summary.progressPercentage}%
          </span>
          <span className="text-xs text-[#526359] block mt-1">
            Single combined goal
          </span>
        </div>

        {/* Unique Contributors */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] shadow-xs">
          <div className="flex items-center justify-between text-[#526359] text-xs font-semibold uppercase mb-2">
            <span>Unique Contributors</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#0a241b]">
            {summary.contributorCount}
          </span>
          <span className="text-xs text-[#526359] block mt-1">
            Across 17 classes
          </span>
        </div>

        {/* Total Contributions */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] shadow-xs">
          <div className="flex items-center justify-between text-[#526359] text-xs font-semibold uppercase mb-2">
            <span>Total Transactions</span>
            <Database className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#0a241b]">
            {summary.contributionCount}
          </span>
          <span className="text-xs text-[#526359] block mt-1">
            Contributions recorded
          </span>
        </div>
      </div>

      {/* 17 Classes Master Leaderboard Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6e2d8] shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-[#0a241b] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#155e42]" />
              All 17 Commerce Classes Status
            </h3>
            <p className="text-xs text-[#526359]">
              Click any class to view private student rosters, full histories, and class-level management.
            </p>
          </div>
          <Link
            href="/admin/classes"
            className="text-xs font-semibold text-[#155e42] hover:underline"
          >
            Manage Classes →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sortedClasses.map((c) => {
            const isTop3 = c.currentRank <= 3;
            return (
              <Link
                key={c.id}
                href={`/admin/classes/${c.id}`}
                className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] flex flex-col justify-between ${
                  c.currentRank === 1
                    ? 'bg-amber-50/50 border-amber-300'
                    : c.currentRank === 2
                    ? 'bg-slate-50 border-slate-300'
                    : c.currentRank === 3
                    ? 'bg-amber-50/20 border-amber-200'
                    : 'bg-[#fbfaf7] border-[#e6e2d8] hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center ${
                      c.currentRank === 1
                        ? 'bg-amber-400 text-amber-950 shadow-xs'
                        : c.currentRank === 2
                        ? 'bg-slate-300 text-slate-800'
                        : c.currentRank === 3
                        ? 'bg-amber-700/20 text-amber-900'
                        : 'bg-white text-[#526359] border border-[#e6e2d8]'
                    }`}
                  >
                    #{c.currentRank}
                  </span>
                  <span className="text-[11px] text-[#526359] font-medium">{c.year}</span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-[#0a241b]">{c.name}</h4>
                  <span className="text-xs text-[#526359]">{c.program}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-[#e6e2d8] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#526359] block text-[10px] uppercase font-semibold">Impact</span>
                    <span className="font-extrabold text-[#155e42]">{formatKg(c.totalEquivalentKg)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#526359] block text-[10px] uppercase font-semibold">Contributors</span>
                    <span className="font-bold text-[#0a241b]">{c.contributorCount}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Department Contributions Feed */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6e2d8] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#0a241b]">
            Recent Department-Wide Contributions
          </h3>
          <Link
            href="/admin/contributions"
            className="text-xs font-semibold text-[#155e42] hover:underline"
          >
            Full Ledger ({contributions.length}) →
          </Link>
        </div>

        {contributions.length > 0 ? (
          <div className="divide-y divide-[#f4f1eb]">
            {contributions.slice(0, 6).map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0a241b]">{c.studentName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold">
                      {c.classId}
                    </span>
                  </div>
                  <span className="text-xs text-[#526359]">
                    {formatDate(c.createdAt)} • Logged by {c.recordedByName || c.recordedBy}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-[#155e42]">
                    +{formatKg(c.equivalentKg)}
                  </span>
                  <span className="text-[11px] text-[#526359] block">
                    {c.type === 'money'
                      ? formatCurrency(c.moneyAmount)
                      : c.type === 'grain'
                      ? `${c.grainQuantityKg} KG ${c.grainType}`
                      : `${formatCurrency(c.moneyAmount)} + ${c.grainQuantityKg} KG`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#526359]">
            No contributions have been recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
