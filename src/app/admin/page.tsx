import Link from 'next/link';
import {
  getPublicCampaignSummary,
  getCampaignConfig,
  getAllClasses,
  getAllContributions,
} from '@/lib/firebase/admin';
import { formatKg, formatCurrency, formatDate } from '@/lib/utils';
import { CampaignConfigCard } from '@/components/admin/CampaignConfigCard';
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
  Sparkles,
  ShieldCheck,
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
      {/* Configuration Status Banner if unconfigured */}
      {!config.isConfigured && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-950 font-headline">
              Campaign Configuration Incomplete
            </h3>
            <p className="text-xs text-amber-800 mt-0.5">
              Please enter the Department Target and Money-to-KG conversion rate in the configuration card below to activate all live trackers.
            </p>
          </div>
        </div>
      )}

      {/* Clean Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#155e42]/10 text-[#155e42] text-[11px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master Governance Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-headline text-[#0a241b] tracking-tight">
            Department Command Center
          </h1>
          <p className="text-xs sm:text-sm text-[#526359] mt-0.5">
            Central dashboard for all 17 Department of Commerce classes and institutional impact telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/reports"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-gray-50 border border-[#e6e2d8] text-[#0a241b] transition-all shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#155e42]" />
            <span>NAAC & NIRF Reports</span>
          </Link>
        </div>
      </div>

      {/* Stitch Executive Impact Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Equivalent Impact */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] ambient-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#526359] text-xs font-bold uppercase mb-2">
            <span>Total Equivalent Impact</span>
            <TrendingUp className="w-4 h-4 text-[#155e42]" />
          </div>
          <div>
            <span className="text-3xl font-black font-headline text-[#155e42] block">
              {formatKg(summary.totalImpactKg)}
            </span>
            <span className="text-xs text-[#526359] block mt-1">
              Target: {summary.targetKg ? formatKg(summary.targetKg) : 'Not set'} ({summary.progressPercentage}%)
            </span>
          </div>
        </div>

        {/* Physical Food Grains */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] ambient-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#526359] text-xs font-bold uppercase mb-2">
            <span>Food Grains Collected</span>
            <Wheat className="w-4 h-4 text-[#155e42]" />
          </div>
          <div>
            <span className="text-3xl font-black font-headline text-[#0a241b] block">
              {formatKg(summary.totalGrainKg || 0)}
            </span>
            <span className="text-xs text-[#526359] block mt-1">
              Direct physical nourishment
            </span>
          </div>
        </div>

        {/* Monetary Resource Pool */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] ambient-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#526359] text-xs font-bold uppercase mb-2">
            <span>Monetary Resource Pool</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <span className="text-3xl font-black font-headline text-[#0a241b] block">
              {formatCurrency(summary.totalMoney || 0)}
            </span>
            <span className="text-xs text-[#526359] block mt-1">
              Rate: ₹{config.moneyToKgRate || 25} / KG Eq
            </span>
          </div>
        </div>

        {/* Total Student Reach */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] ambient-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#526359] text-xs font-bold uppercase mb-2">
            <span>Student Changemakers</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <span className="text-3xl font-black font-headline text-[#0a241b] block">
              {summary.contributorCount}
            </span>
            <span className="text-xs text-[#526359] block mt-1">
              Across all 17 Commerce classes
            </span>
          </div>
        </div>
      </div>

      {/* Campaign Target & Conversion Rules Inline Configuration Card */}
      <CampaignConfigCard
        initialTargetKg={config.targetKg}
        initialMoneyToKgRate={config.moneyToKgRate}
        isConfigured={config.isConfigured}
      />

      {/* 17 Classes Master Leaderboard Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6e2d8] ambient-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black font-headline text-[#0a241b] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#155e42]" />
              <span>All 17 Commerce Classes Status</span>
            </h3>
            <p className="text-xs text-[#526359] mt-0.5">
              Click any class to inspect private student rosters, full histories, and class-level management.
            </p>
          </div>
          <Link
            href="/admin/classes"
            className="text-xs font-bold text-[#155e42] hover:underline"
          >
            Manage Classes →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sortedClasses.map((c) => {
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
                    : 'bg-[#fcf9f3] border-[#e6e2d8] hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-7 h-7 rounded-lg text-xs font-black font-headline flex items-center justify-center ${
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
                    <span className="font-black font-headline text-[#155e42]">{formatKg(c.totalEquivalentKg)}</span>
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
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6e2d8] ambient-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black font-headline text-[#0a241b]">
            Recent Department-Wide Contributions
          </h3>
          <Link
            href="/admin/contributions"
            className="text-xs font-bold text-[#155e42] hover:underline"
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
                  <span className="font-black font-headline text-[#155e42]">
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
