import { cookies } from 'next/headers';
import Link from 'next/link';
import {
  getUserProfile,
  getClass,
  getAllClasses,
  getContributionsByClass,
  getStudentsByClass,
  getPublicCampaignSummary,
  getCampaignConfig,
} from '@/lib/firebase/admin';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { formatKg, formatCurrency, formatDate } from '@/lib/utils';
import { CrStudentRosterTable } from '@/components/cr/CrStudentRosterTable';
import {
  Trophy,
  Users,
  Wheat,
  Coins,
  History,
  PlusCircle,
  Award,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Lock,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CrDashboardPage() {
  const cookieStore = await cookies();
  const uid = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const user = uid ? await getUserProfile(uid) : null;
  const classId = user?.classId || '2-bcom-afa';

  const [classDoc, allClasses, contributions, students, summary, config] = await Promise.all([
    getClass(classId),
    getAllClasses(),
    getContributionsByClass(classId),
    getStudentsByClass(classId),
    getPublicCampaignSummary(),
    getCampaignConfig(),
  ]);

  if (!classDoc) {
    return <div className="p-8 text-center text-sm text-[#526359]">Class not found.</div>;
  }

  // Calculate competitor gaps
  const sortedClasses = [...allClasses].sort((a, b) => a.currentRank - b.currentRank);
  const currentIndex = sortedClasses.findIndex((c) => c.id === classId);
  const classAbove = currentIndex > 0 ? sortedClasses[currentIndex - 1] : null;
  const classBelow =
    currentIndex < sortedClasses.length - 1 ? sortedClasses[currentIndex + 1] : null;

  const gapToAbove = classAbove
    ? Math.max(0, Math.round((classAbove.totalEquivalentKg - classDoc.totalEquivalentKg) * 100) / 100)
    : 0;
  const gapToBelow = classBelow
    ? Math.max(0, Math.round((classDoc.totalEquivalentKg - classBelow.totalEquivalentKg) * 100) / 100)
    : 0;

  const totalStudentsCount = students.length || 78;
  const participationPercent = Math.round((classDoc.contributorCount / totalStudentsCount) * 100);

  return (
    <div className="space-y-8">
      {/* 1. CR Identity & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#e6e2d8] ambient-shadow">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#155e42]/10 text-[#155e42] text-[11px] font-bold uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5 text-[#155e42]" />
              <span>Class Representative Console</span>
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {classDoc.year} • {classDoc.program}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-headline text-[#0a241b] tracking-tight">
            {classDoc.name} Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[#526359] mt-0.5">
            Logged in as {user?.name || 'Class Representative'}. Real-time student roster and contribution entry.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/cr/contributions/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#155e42] text-white font-bold text-xs hover:bg-[#0a241b] transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-[#86efac]" />
            <span>Record New Contribution</span>
          </Link>
        </div>
      </div>

      {/* 2. Stitch Quick Stats Ribbon (Bento 4-Card Grid) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Class Impact */}
        <div className="bg-white rounded-2xl border border-[#e6e2d8] p-6 ambient-shadow flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Trophy className="w-28 h-28 text-amber-500" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#526359] flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-4 h-4 text-[#155e42]" />
              Total Class Impact
            </span>
            <div className="text-3xl font-black font-headline text-[#0a241b] mt-2 mb-2">
              {formatKg(classDoc.totalEquivalentKg)}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-500/10 w-fit px-2.5 py-1 rounded-full border border-amber-400/30">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Rank #{classDoc.currentRank} of 17 Classes</span>
          </div>
        </div>

        {/* Participation Progress */}
        <div className="bg-white rounded-2xl border border-[#e6e2d8] p-6 ambient-shadow flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#526359] flex items-center gap-1.5 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              Student Participation
            </span>
            <div className="text-3xl font-black font-headline text-[#0a241b] mt-2 mb-2">
              {classDoc.contributorCount} <span className="text-sm font-normal text-gray-400">/ {totalStudentsCount}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="w-full bg-[#f0eee8] rounded-full h-2 overflow-hidden border border-[#e6e2d8]">
              <div
                className="bg-gradient-to-r from-[#155e42] to-[#22c55e] h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, Math.max(5, participationPercent))}%` }}
              />
            </div>
            <div className="text-[11px] font-bold text-[#155e42] text-right">
              {participationPercent}% Class Enrolled
            </div>
          </div>
        </div>

        {/* Grain Breakdown */}
        <div className="bg-white rounded-2xl border border-[#e6e2d8] p-6 ambient-shadow flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#526359] flex items-center gap-1.5 mb-1">
              <Wheat className="w-4 h-4 text-amber-700" />
              Physical Grains
            </span>
            <div className="text-3xl font-black font-headline text-[#0a241b] mt-2 mb-2">
              {formatKg(classDoc.totalGrainKg)}
            </div>
          </div>
          <div className="flex gap-2 text-[10px] font-semibold">
            <div className="bg-[#fcf9f3] px-2.5 py-1 rounded-lg border border-[#e6e2d8] flex-1 text-center">
              <span className="text-gray-400 block text-[9px] uppercase">Grains</span>
              <span className="text-[#0a241b] font-bold">{formatKg(classDoc.totalGrainKg)}</span>
            </div>
            <div className="bg-[#fcf9f3] px-2.5 py-1 rounded-lg border border-[#e6e2d8] flex-1 text-center">
              <span className="text-gray-400 block text-[9px] uppercase">Status</span>
              <span className="text-emerald-700 font-bold">Verified</span>
            </div>
          </div>
        </div>

        {/* Monetary Funds */}
        <div className="bg-white rounded-2xl border border-[#e6e2d8] p-6 ambient-shadow flex flex-col justify-between bg-gradient-to-br from-white to-[#fcf9f3]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#526359] flex items-center gap-1.5 mb-1">
              <Coins className="w-4 h-4 text-emerald-600" />
              Monetary Support
            </span>
            <div className="text-3xl font-black font-headline text-[#0a241b] mt-2 mb-2">
              {formatCurrency(classDoc.totalMoney)}
            </div>
          </div>
          <div className="bg-[#fcf9f3] px-2.5 py-1.5 rounded-xl border border-[#e6e2d8] text-[11px] text-[#526359]">
            Yielding <strong className="text-[#155e42] font-bold">+{formatKg(Math.round(classDoc.totalMoney / (config.moneyToKgRate || 25)))}</strong> Eq KG
          </div>
        </div>
      </section>

      {/* 3. Main Workspace: Left Analytics & Right Roster + Ledger */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT COLUMN: Fixed 380px Desktop Width */}
        <div className="w-full lg:w-[380px] lg:flex-shrink-0 space-y-6">
          {/* Competitive Standings Analysis Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#e6e2d8] ambient-shadow space-y-4">
            <h3 className="text-sm font-black font-headline text-[#0a241b] flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Leaderboard Competitive Analysis</span>
            </h3>

            <div className="space-y-3">
              {/* Position Ahead */}
              <div className="bg-[#fcf9f3] p-4 rounded-2xl border border-[#e6e2d8]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#526359] block mb-1">
                  Class Above
                </span>
                {classAbove ? (
                  <div>
                    <p className="text-xs font-bold text-[#0a241b]">
                      #{classAbove.currentRank} {classAbove.name} ({formatKg(classAbove.totalEquivalentKg)})
                    </p>
                    <p className="text-xs text-amber-700 font-semibold mt-1">
                      Need <strong>{formatKg(gapToAbove)}</strong> equivalent impact to overtake!
                    </p>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    🥇 Leading the Department in 1st Place!
                  </p>
                )}
              </div>

              {/* Position Behind */}
              <div className="bg-[#fcf9f3] p-4 rounded-2xl border border-[#e6e2d8]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#526359] block mb-1">
                  Class Behind
                </span>
                {classBelow ? (
                  <div>
                    <p className="text-xs font-bold text-[#0a241b]">
                      #{classBelow.currentRank} {classBelow.name} ({formatKg(classBelow.totalEquivalentKg)})
                    </p>
                    <p className="text-xs text-emerald-700 font-semibold mt-1">
                      Holding a <strong>+{formatKg(gapToBelow)}</strong> impact lead.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#526359]">
                    Log contributions to climb the leaderboard rankings.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Institutional Privacy Guarantee Card */}
          <div className="bg-white rounded-3xl border border-[#e6e2d8] ambient-shadow p-5 flex items-start gap-3">
            <Lock className="w-4 h-4 text-[#155e42] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#526359] leading-relaxed">
              <strong className="text-[#0a241b] block font-bold mb-0.5">Strict Confidentiality Guard:</strong>
              Individual student contribution numbers and money amounts are confidential. Only overall class aggregate metrics and student names are displayed on public department boards.
            </div>
          </div>

          {/* Class Quick Navigation Shortcuts */}
          <div className="bg-white rounded-3xl border border-[#e6e2d8] ambient-shadow p-6 space-y-3 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#526359] block">
              Class Administration Hub
            </span>

            <div className="space-y-2">
              <Link
                href="/cr/students"
                className="flex items-center justify-between p-3 rounded-xl bg-[#fcf9f3] border border-[#e6e2d8] hover:bg-white hover:border-[#155e42] transition-all group font-bold text-[#0a241b]"
              >
                <span>Manage Students & CSV Import</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#155e42]" />
              </Link>

              <Link
                href="/cr/contributions"
                className="flex items-center justify-between p-3 rounded-xl bg-[#fcf9f3] border border-[#e6e2d8] hover:bg-white hover:border-[#155e42] transition-all group font-bold text-[#0a241b]"
              >
                <span>Full Class Contribution Ledger</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#155e42]" />
              </Link>

              <Link
                href={`/class/${classId}`}
                className="flex items-center justify-between p-3 rounded-xl bg-[#fcf9f3] border border-[#e6e2d8] hover:bg-white hover:border-[#155e42] transition-all group font-bold text-[#0a241b]"
              >
                <span>Public Class Page View</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#155e42]" />
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Fills All Remaining Width */}
        <div className="w-full lg:flex-1 min-w-0 space-y-6">
          {/* Interactive Class Student Roster Component */}
          <CrStudentRosterTable students={students} classId={classId} />

          {/* Recent Class Contributions List */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6e2d8] ambient-shadow">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0ede6]">
              <div>
                <h3 className="text-base font-black font-headline text-[#0a241b] flex items-center gap-2">
                  <History className="w-4 h-4 text-[#155e42]" />
                  <span>Recent Class Submissions</span>
                </h3>
                <p className="text-xs text-[#526359] mt-0.5">
                  Latest recorded donations for {classDoc.name}.
                </p>
              </div>
              <Link
                href="/cr/contributions"
                className="text-xs font-bold text-[#155e42] hover:text-[#0a241b] flex items-center gap-1"
              >
                <span>Full History ({contributions.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {contributions.length > 0 ? (
              <div className="divide-y divide-[#f4f1eb]">
                {contributions.slice(0, 5).map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#0a241b] text-sm block">{c.studentName}</span>
                      <span className="text-gray-500 text-[11px] mt-0.5 block">
                        {formatDate(c.createdAt)} • {c.type === 'money' ? 'Monetary' : c.type === 'grain' ? `${c.grainType} (${formatKg(c.grainQuantityKg)})` : 'Money & Grain'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black font-headline text-sm text-[#155e42] block">
                        +{formatKg(c.equivalentKg)}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {c.type === 'money' ? formatCurrency(c.moneyAmount) : c.grainQuantityKg ? `${c.grainQuantityKg} KG` : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#526359] text-xs">
                No contributions recorded yet. Click "Record New Contribution" to log your class's first donation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
