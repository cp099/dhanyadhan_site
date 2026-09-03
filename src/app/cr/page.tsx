import { cookies } from 'next/headers';
import Link from 'next/link';
import {
  getUserProfile,
  getClass,
  getAllClasses,
  getContributionsByClass,
  getPublicCampaignSummary,
} from '@/lib/firebase/admin';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { formatKg, formatCurrency, formatDate } from '@/lib/utils';
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
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CrDashboardPage() {
  const cookieStore = await cookies();
  const uid = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const user = uid ? await getUserProfile(uid) : null;
  const classId = user?.classId || '2-bcom-afa';

  const [classDoc, allClasses, contributions, summary] = await Promise.all([
    getClass(classId),
    getAllClasses(),
    getContributionsByClass(classId),
    getPublicCampaignSummary(),
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

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#e6e2d8] ambient-shadow">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#155e42]/10 text-[#155e42] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Class Representative Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-headline text-[#0a241b] tracking-tight">
            {classDoc.name} Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-[#526359] mt-0.5">
            Tracking contributions and competitive standing for {classDoc.program} ({classDoc.year}).
          </p>
        </div>
        <Link
          href="/cr/contributions/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#155e42] text-white font-bold text-xs hover:bg-[#0a241b] transition-all shadow-sm flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-[#86efac]" />
          <span>Record New Contribution</span>
        </Link>
      </div>

      {/* Stitch Class KPI Ribbon (5 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Current Rank */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] ambient-shadow col-span-2 sm:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#526359] text-xs font-bold uppercase mb-2">
            <span>Rank</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black font-headline text-amber-600">
                #{classDoc.currentRank}
              </span>
              <span className="text-xs text-[#526359]">/ 17</span>
            </div>
            <span className="text-[11px] text-[#526359] block mt-1">Department Standings</span>
          </div>
        </div>

        {/* Total Impact */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] ambient-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#526359] text-xs font-bold uppercase mb-2">
            <span>Class Impact</span>
            <TrendingUp className="w-4 h-4 text-[#155e42]" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black font-headline text-[#155e42] block">
              {formatKg(classDoc.totalEquivalentKg)}
            </span>
            <span className="text-[11px] text-[#526359] block mt-1">Equivalent Total</span>
          </div>
        </div>

        {/* Unique Contributors */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] ambient-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#526359] text-xs font-bold uppercase mb-2">
            <span>Contributors</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black font-headline text-[#0a241b] block">
              {classDoc.contributorCount}
            </span>
            <span className="text-[11px] text-[#526359] block mt-1">Active Students</span>
          </div>
        </div>

        {/* Physical Grain */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] ambient-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#526359] text-xs font-bold uppercase mb-2">
            <span>Grain Collected</span>
            <Wheat className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black font-headline text-amber-900 block">
              {formatKg(classDoc.totalGrainKg)}
            </span>
            <span className="text-[11px] text-[#526359] block mt-1">Food grain weight</span>
          </div>
        </div>

        {/* Monetary Support */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] ambient-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#526359] text-xs font-bold uppercase mb-2">
            <span>Monetary Raised</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black font-headline text-emerald-700 block">
              {formatCurrency(classDoc.totalMoney)}
            </span>
            <span className="text-[11px] text-[#526359] block mt-1">Financial Pool</span>
          </div>
        </div>
      </div>

      {/* Competitive Standings Analysis Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e6e2d8] ambient-shadow">
        <h3 className="text-base font-black font-headline text-[#0a241b] mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Competition Standing Analysis</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#fcf9f3] p-4 rounded-2xl border border-[#e6e2d8]">
            <span className="text-[11px] font-bold uppercase text-[#526359] block mb-1">
              Position Ahead
            </span>
            {classAbove ? (
              <div>
                <p className="text-sm font-bold text-[#0a241b]">
                  #{classAbove.currentRank} {classAbove.name} ({formatKg(classAbove.totalEquivalentKg)})
                </p>
                <p className="text-xs text-amber-700 font-medium mt-1">
                  Need <strong>{formatKg(gapToAbove)}</strong> equivalent impact to overtake!
                </p>
              </div>
            ) : (
              <p className="text-sm font-bold text-emerald-700">
                🥇 Leading the Department in 1st Place!
              </p>
            )}
          </div>

          <div className="bg-[#fcf9f3] p-4 rounded-2xl border border-[#e6e2d8]">
            <span className="text-[11px] font-bold uppercase text-[#526359] block mb-1">
              Position Behind
            </span>
            {classBelow ? (
              <div>
                <p className="text-sm font-bold text-[#0a241b]">
                  #{classBelow.currentRank} {classBelow.name} ({formatKg(classBelow.totalEquivalentKg)})
                </p>
                <p className="text-xs text-emerald-700 font-medium mt-1">
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

      {/* Recent Class Contributions List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6e2d8] ambient-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black font-headline text-[#0a241b] flex items-center gap-2">
            <History className="w-5 h-5 text-[#155e42]" />
            <span>Recent Class Contributions</span>
          </h3>
          <Link
            href="/cr/contributions"
            className="text-xs font-bold text-[#155e42] hover:text-[#0a241b] flex items-center gap-1"
          >
            View All ({contributions.length}) <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {contributions.length > 0 ? (
          <div className="divide-y divide-[#f4f1eb]">
            {contributions.slice(0, 5).map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-bold text-[#0a241b] block">{c.studentName}</span>
                  <span className="text-xs text-[#526359]">
                    {formatDate(c.createdAt)} • {c.type === 'money' ? 'Monetary' : c.type === 'grain' ? `${c.grainType} (${formatKg(c.grainQuantityKg)})` : 'Money & Grain'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-black font-headline text-[#155e42] block">
                    +{formatKg(c.equivalentKg)}
                  </span>
                  <span className="text-[11px] text-[#526359]">
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
  );
}
