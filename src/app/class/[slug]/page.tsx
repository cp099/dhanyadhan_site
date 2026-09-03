import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getClass, getPublicClassLeaderboard, getAllClasses } from '@/lib/firebase/admin';
import { formatKg } from '@/lib/utils';
import { PublicStudentLeaderboard } from '@/components/public/PublicStudentLeaderboard';
import { Trophy, Users, ArrowLeft, ArrowUpRight, Award, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClassDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const [classData, publicLeaderboard, allClasses] = await Promise.all([
    getClass(slug),
    getPublicClassLeaderboard(slug),
    getAllClasses(),
  ]);

  if (!classData) {
    notFound();
  }

  // Find nearby competitors in the 17-class standings
  const sortedClasses = [...allClasses].sort((a, b) => a.currentRank - b.currentRank);
  const currentIndex = sortedClasses.findIndex((c) => c.id === slug);
  const classAbove = currentIndex > 0 ? sortedClasses[currentIndex - 1] : null;
  const classBelow =
    currentIndex < sortedClasses.length - 1 ? sortedClasses[currentIndex + 1] : null;

  const gapToAbove = classAbove
    ? Math.max(0, Math.round((classAbove.totalEquivalentKg - classData.totalEquivalentKg) * 100) / 100)
    : 0;
  const gapToBelow = classBelow
    ? Math.max(0, Math.round((classData.totalEquivalentKg - classBelow.totalEquivalentKg) * 100) / 100)
    : 0;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back to Leaderboard navigation */}
      <div className="mb-6">
        <Link
          href="/#leaderboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#155e42] hover:text-[#0a241b] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Main Leaderboard
        </Link>
      </div>

      {/* Class Overview Banner */}
      <div className="bg-gradient-to-br from-[#0a241b] to-[#155e42] rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/30 text-[#86efac] text-xs font-semibold uppercase tracking-wider mb-3">
              <span>{classData.program}</span>
              <span>•</span>
              <span>{classData.year}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#fbfaf7]">
              {classData.name}
            </h1>
            <p className="text-sm text-gray-300 mt-2">
              Official Commerce Department Standing • {classData.contributorCount} Unique Student Contributors
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Current Rank Card */}
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center min-w-[130px]">
              <span className="text-xs uppercase tracking-wider text-gray-300 block mb-1">
                Department Rank
              </span>
              <div className="flex items-center justify-center gap-1.5">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span className="text-3xl font-black text-amber-300">
                  #{classData.currentRank}
                </span>
                <span className="text-xs text-gray-300">/ 17</span>
              </div>
            </div>

            {/* Impact KG Card */}
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center min-w-[140px]">
              <span className="text-xs uppercase tracking-wider text-gray-300 block mb-1">
                Total Class Impact
              </span>
              <span className="text-3xl font-black text-[#86efac]">
                {formatKg(classData.totalEquivalentKg)}
              </span>
            </div>
          </div>
        </div>

        {/* Nearby Competitors Bar */}
        {(classAbove || classBelow) && (
          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {classAbove ? (
              <div className="bg-white/5 p-3 rounded-xl flex items-center justify-between border border-white/10">
                <span className="text-gray-300">
                  Behind <strong>#{classAbove.currentRank} {classAbove.name}</strong>:
                </span>
                <span className="font-bold text-amber-300">{formatKg(gapToAbove)} gap</span>
              </div>
            ) : (
              <div className="bg-amber-400/20 p-3 rounded-xl flex items-center gap-2 text-amber-300 border border-amber-400/30">
                <Award className="w-4 h-4" />
                <span className="font-bold">🥇 1st Place — Leading the entire department!</span>
              </div>
            )}

            {classBelow ? (
              <div className="bg-white/5 p-3 rounded-xl flex items-center justify-between border border-white/10">
                <span className="text-gray-300">
                  Ahead of <strong>#{classBelow.currentRank} {classBelow.name}</strong>:
                </span>
                <span className="font-bold text-[#86efac]">+{formatKg(gapToBelow)} lead</span>
              </div>
            ) : (
              <div className="bg-white/5 p-3 rounded-xl text-gray-300">
                Every grain recorded moves {classData.name} up the ranks!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Public Student Leaderboard: Names & Ranks ONLY */}
      <PublicStudentLeaderboard
        students={publicLeaderboard?.students || []}
        className={classData.name}
      />
    </div>
  );
}
