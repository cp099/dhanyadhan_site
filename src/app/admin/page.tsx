import Link from 'next/link';
import {
  getPublicCampaignSummary,
  getCampaignConfig,
  getAllClasses,
  getAllContributions,
} from '@/lib/firebase/admin';
import { formatKg, formatCurrency, formatDate } from '@/lib/utils';
import { CampaignConfigCard } from '@/components/admin/CampaignConfigCard';
import { MasterAuditTable } from '@/components/admin/MasterAuditTable';
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
  Globe2,
  FileCheck,
  Download,
  Building,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [summary, config, classes, contributions] = await Promise.all([
    getPublicCampaignSummary(),
    getCampaignConfig(),
    getAllClasses(),
    getAllContributions(),
  ]);

  const sortedClasses = [...classes].sort((a, b) => {
    if (a.currentRank && b.currentRank) return a.currentRank - b.currentRank;
    if (a.currentRank) return -1;
    if (b.currentRank) return 1;
    return a.name.localeCompare(b.name);
  });

  const targetKg = summary.targetKg || 0;
  const currentKg = summary.totalImpactKg || 0;
  const progressPercent = summary.progressPercentage || 0;
  const totalStudents = 1360;
  const participationPercent = Math.round((summary.contributorCount / totalStudents) * 100);

  return (
    <div className="space-y-8">
      {/* 1. Configuration Incomplete Alert Banner */}
      {!config.isConfigured && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 flex items-start gap-3.5 ambient-shadow">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-950 font-headline">
              Campaign Setup Notice
            </h3>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              Official departmental target and conversion rates are currently not saved. Update the Campaign Rules card below to activate live target meters across all public and student views.
            </p>
          </div>
        </div>
      )}

      {/* 2. Executive Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#e6e2d8] ambient-shadow">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#155e42]/10 text-[#155e42] text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#155e42]" />
              <span>SDG Cell Master Console</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Campaign Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-headline text-[#0a241b] tracking-tight">
            Institutional Impact Command Center
          </h1>
          <p className="text-xs sm:text-sm text-[#526359] mt-1">
            Department of Commerce • Overseeing 17 class streams, physical grain aggregation, and UN SDG alignment.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/reports"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#fcf9f3] hover:bg-[#f0eee8] border border-[#e6e2d8] text-[#0a241b] transition-all shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#155e42]" />
            <span>Accreditation Hub</span>
          </Link>
          <Link
            href="/#leaderboard"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#155e42] text-white hover:bg-[#0a241b] transition-all shadow-xs"
          >
            <Globe2 className="w-4 h-4 text-[#86efac]" />
            <span>Public Leaderboard</span>
          </Link>
        </div>
      </div>

      {/* 3. Stitch 5-Column Bento Telemetry Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Equivalent Impact (Spans 2 columns) */}
        <div className="bg-white rounded-2xl border border-[#e6e2d8] p-6 ambient-shadow lg:col-span-2 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Globe2 className="w-44 h-44 text-[#155e42]" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#526359] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#155e42]" />
                Total Equivalent Impact
              </span>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                UN SDG 2 & 12
              </span>
            </div>
            <p className="text-xs text-[#526359] mb-4">Unified Grain & Monetary Equivalent</p>
          </div>

          <div>
            <div className="text-4xl sm:text-5xl font-black font-headline text-[#155e42] mb-3">
              {formatKg(currentKg)}
            </div>

            <div className="flex justify-between text-xs text-[#526359] font-medium mb-1.5">
              <span>{progressPercent}% of Department Target</span>
              <span>{targetKg > 0 ? formatKg(targetKg) : 'Target TBD'}</span>
            </div>

            <div className="w-full bg-[#f0eee8] rounded-full h-2.5 overflow-hidden p-0.5 border border-[#e6e2d8]">
              <div
                className="bg-gradient-to-r from-[#155e42] via-[#22c55e] to-[#4ade80] h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, Math.max(2, progressPercent))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Food Grain Aggregation */}
        <div className="bg-white rounded-2xl border border-[#e6e2d8] p-6 ambient-shadow flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#526359] flex items-center gap-1.5 mb-1">
              <Wheat className="w-4 h-4 text-amber-700" />
              Physical Food Grains
            </span>
            <p className="text-[11px] text-[#526359] mb-3">Direct Community Nourishment</p>
          </div>

          <div>
            <div className="text-3xl font-black font-headline text-[#0a241b] mb-4">
              {formatKg(summary.totalGrainKg || 0)}
            </div>

            <div className="space-y-1.5 text-xs text-[#526359] border-t border-[#f4f1eb] pt-3">
              <div className="flex justify-between items-center text-[11px]">
                <span>Rice & Staple</span>
                <span className="font-bold text-[#0a241b]">{formatKg(summary.totalGrainKg || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span>Pulses & Dal</span>
                <span className="font-semibold text-emerald-700">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monetary Resource Pool */}
        <div className="bg-white rounded-2xl border border-[#e6e2d8] p-6 ambient-shadow flex flex-col justify-between bg-gradient-to-br from-white to-[#fcf9f3]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#526359] flex items-center gap-1.5 mb-1">
              <Coins className="w-4 h-4 text-amber-600" />
              Monetary Resource Pool
            </span>
            <p className="text-[11px] text-[#526359] mb-3">Community Grain Procurement</p>
          </div>

          <div>
            <div className="text-3xl font-black font-headline text-[#0a241b] mb-4">
              {formatCurrency(summary.totalMoney || 0)}
            </div>

            <div className="bg-[#fcf9f3] p-2.5 rounded-xl border border-[#e6e2d8] text-[11px] text-[#526359]">
              Rate: <strong className="text-[#155e42]">₹{config.moneyToKgRate || 25}</strong> = 1.0 kg equivalent
            </div>
          </div>
        </div>

        {/* Reach & Sync (Stacked Mini Cards) */}
        <div className="grid grid-rows-2 gap-3 lg:col-span-1">
          {/* Total Student Reach */}
          <div className="bg-white rounded-2xl border border-[#e6e2d8] p-4 ambient-shadow flex flex-col justify-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#526359] mb-0.5">
              Student Changemakers
            </span>
            <div className="text-xl font-black font-headline text-[#0a241b]">
              {summary.contributorCount} <span className="text-xs font-normal text-gray-500">/ 1,360</span>
            </div>
            <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit mt-1.5">
              <Users className="w-3 h-3" />
              <span>{participationPercent}% Participation</span>
            </div>
          </div>

          {/* Reporting Classes */}
          <div className="bg-white rounded-2xl border border-[#e6e2d8] p-4 ambient-shadow flex flex-col justify-center border-l-4 border-l-[#155e42]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#526359] mb-0.5">
              Reporting Cohorts
            </span>
            <div className="text-xl font-black font-headline text-[#0a241b]">
              17 of 17 Classes
            </div>
            <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mt-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>100% Synced & Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Main Workspace Grid: 1 Col Left (Rules & Compliance), 2 Cols Right (Audit Table & Ledger) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT COLUMN: Fixed 380px Desktop Width */}
        <div className="w-full lg:w-[380px] lg:flex-shrink-0 space-y-6">
          {/* Campaign Target & Conversion Rules Inline Card */}
          <CampaignConfigCard
            initialTargetKg={config.targetKg}
            initialMoneyToKgRate={config.moneyToKgRate}
            isConfigured={config.isConfigured}
          />

          {/* Compliance & Accreditation Export Hub Card */}
          <div className="bg-white rounded-3xl border border-[#e6e2d8] ambient-shadow overflow-hidden">
            <div className="bg-[#fcf9f3] px-6 py-4 border-b border-[#e6e2d8] flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#155e42]" />
              <h3 className="text-sm font-black font-headline text-[#0a241b]">
                Accreditation & Audit Hub
              </h3>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-gray-600 leading-relaxed">
                Generate certified institutional exports for NAAC Criteria 7.1.8 / 7.1.9 and NIRF Social Impact filings.
              </p>

              <div className="space-y-2.5">
                <a
                  href="/api/reports/export?type=department"
                  download
                  className="w-full flex items-center justify-between p-3 rounded-2xl border border-[#e6e2d8] bg-[#fcf9f3] hover:bg-white hover:border-[#155e42] transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-[#155e42]" />
                    <span className="font-bold text-[#0a241b]">Department Master Report</span>
                  </div>
                  <Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#155e42]" />
                </a>

                <a
                  href="/api/reports/export?type=contributions"
                  download
                  className="w-full flex items-center justify-between p-3 rounded-2xl border border-[#e6e2d8] bg-[#fcf9f3] hover:bg-white hover:border-[#155e42] transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4 text-amber-700" />
                    <span className="font-bold text-[#0a241b]">Complete Audit Ledger (CSV)</span>
                  </div>
                  <Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#155e42]" />
                </a>
              </div>

              <div className="pt-2">
                <Link
                  href="/admin/reports"
                  className="text-[11px] font-bold text-[#155e42] hover:underline flex items-center gap-1"
                >
                  <span>Open Full Institutional Export Hub</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Fills All Remaining Width */}
        <div className="w-full lg:flex-1 min-w-0 space-y-6">
          {/* Master 17-Class Audit Table Component with Year Filtering and Search */}
          <MasterAuditTable classes={sortedClasses} />

          {/* Recent Department Contributions Stream */}
          <div className="bg-white rounded-3xl border border-[#e6e2d8] ambient-shadow p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0ede6]">
              <div>
                <h3 className="text-base font-black font-headline text-[#0a241b] flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#155e42]" />
                  <span>Recent Department-Wide Transactions</span>
                </h3>
                <p className="text-xs text-[#526359] mt-0.5">
                  Live verified contribution events from Class Representatives.
                </p>
              </div>
              <Link
                href="/admin/contributions"
                className="text-xs font-bold text-[#155e42] hover:underline flex items-center gap-1"
              >
                <span>Full Ledger ({contributions.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {contributions.length > 0 ? (
              <div className="divide-y divide-[#f4f1eb]">
                {contributions.slice(0, 5).map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0a241b] text-sm">{c.studentName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold text-[10px]">
                          {c.classId}
                        </span>
                      </div>
                      <span className="text-gray-500 text-[11px] mt-0.5 block">
                        {formatDate(c.createdAt)} • Verified by {c.recordedByName || c.recordedBy}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black font-headline text-sm text-[#155e42] block">
                        +{formatKg(c.equivalentKg)}
                      </span>
                      <span className="text-[11px] text-gray-500">
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
      </div>
    </div>
  );
}
