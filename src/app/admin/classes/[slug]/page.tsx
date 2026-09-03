import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getClass,
  getStudentsByClass,
  getContributionsByClass,
} from '@/lib/firebase/admin';
import { formatKg, formatCurrency, formatDate } from '@/lib/utils';
import {
  GraduationCap,
  Trophy,
  Users,
  Wheat,
  Coins,
  History,
  ArrowLeft,
  Download,
  PlusCircle,
  UserCheck,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminClassDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const [classDoc, students, contributions] = await Promise.all([
    getClass(slug),
    getStudentsByClass(slug),
    getContributionsByClass(slug),
  ]);

  if (!classDoc) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Back link */}
      <div>
        <Link
          href="/admin/classes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#155e42] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Classes
        </Link>
      </div>

      {/* Class Overview Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e6e2d8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#155e42]/10 text-[#155e42] font-bold uppercase">
              {classDoc.year} • {classDoc.program}
            </span>
            <span className="text-xs text-[#526359]">Class ID: {classDoc.id}</span>
          </div>
          <h2 className="text-3xl font-black text-[#0a241b]">{classDoc.name}</h2>
          <p className="text-xs text-[#526359] mt-1">
            Class Representative:{' '}
            <strong className="text-[#0a241b]">
              {classDoc.crName || 'None assigned'}
            </strong>{' '}
            {classDoc.crEmail && `(${classDoc.crEmail})`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`/api/reports/export?type=class&classId=${classDoc.id}`}
            download
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e6e2d8] text-xs font-bold text-[#155e42] hover:bg-[#fbfaf7] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Class CSV
          </a>
          <div className="px-5 py-3 rounded-2xl bg-[#0a241b] text-white text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-300 block">
              Department Rank
            </span>
            <span className="text-2xl font-black text-amber-400">
              #{classDoc.currentRank}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] shadow-xs">
          <span className="text-xs font-semibold text-[#526359] uppercase block mb-1">
            Total Impact
          </span>
          <span className="text-2xl font-black text-[#155e42]">
            {formatKg(classDoc.totalEquivalentKg)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] shadow-xs">
          <span className="text-xs font-semibold text-[#526359] uppercase block mb-1">
            Contributors
          </span>
          <span className="text-2xl font-black text-[#0a241b]">
            {classDoc.contributorCount} students
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] shadow-xs">
          <span className="text-xs font-semibold text-[#526359] uppercase block mb-1">
            Physical Grain
          </span>
          <span className="text-2xl font-black text-amber-900">
            {formatKg(classDoc.totalGrainKg)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] shadow-xs">
          <span className="text-xs font-semibold text-[#526359] uppercase block mb-1">
            Money Raised
          </span>
          <span className="text-2xl font-black text-emerald-700">
            {formatCurrency(classDoc.totalMoney)}
          </span>
        </div>
      </div>

      {/* Student Roster (Private SDG View) */}
      <div className="bg-white rounded-3xl p-6 border border-[#e6e2d8] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#0a241b] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#155e42]" />
            Class Student Roster ({students.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e6e2d8] text-[#526359] text-xs uppercase tracking-wider bg-[#fbfaf7]">
                <th className="py-2.5 px-4">Student Name</th>
                <th className="py-2.5 px-4">Roll No</th>
                <th className="py-2.5 px-4 text-right">Physical Grain</th>
                <th className="py-2.5 px-4 text-right">Money</th>
                <th className="py-2.5 px-4 text-right">Impact Score</th>
                <th className="py-2.5 px-4 text-center">Contributions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f1eb]">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-[#fbfaf7]">
                  <td className="py-2.5 px-4 font-bold text-[#0a241b]">{s.name}</td>
                  <td className="py-2.5 px-4 text-xs text-[#526359]">{s.rollNo || '—'}</td>
                  <td className="py-2.5 px-4 text-right text-xs text-amber-900 font-semibold">
                    {formatKg(s.totalGrainKg)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-xs text-emerald-700 font-semibold">
                    {formatCurrency(s.totalMoney)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-[#155e42]">
                    {formatKg(s.totalEquivalentKg)}
                  </td>
                  <td className="py-2.5 px-4 text-center text-xs text-[#526359]">
                    {s.contributionCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {students.length === 0 && (
          <div className="py-8 text-center text-xs text-[#526359]">
            No students enrolled in this class yet. Use the Student Roster import tool.
          </div>
        )}
      </div>

      {/* Class Contributions History */}
      <div className="bg-white rounded-3xl p-6 border border-[#e6e2d8] shadow-xs">
        <h3 className="text-base font-bold text-[#0a241b] mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-[#155e42]" />
          Contribution Transactions ({contributions.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e6e2d8] text-[#526359] text-xs uppercase tracking-wider bg-[#fbfaf7]">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Student</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Submitted Details</th>
                <th className="py-2.5 px-4 text-right">Official Impact</th>
                <th className="py-2.5 px-4">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f1eb]">
              {contributions.map((c) => (
                <tr key={c.id} className="hover:bg-[#fbfaf7]">
                  <td className="py-2.5 px-4 text-xs text-[#526359]">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-[#0a241b]">{c.studentName}</td>
                  <td className="py-2.5 px-4 text-xs uppercase font-semibold text-gray-700">
                    {c.type}
                  </td>
                  <td className="py-2.5 px-4 text-xs text-[#526359]">
                    {c.type === 'money' && formatCurrency(c.moneyAmount)}
                    {c.type === 'grain' && `${c.grainQuantityKg} KG ${c.grainType}`}
                    {c.type === 'both' &&
                      `${formatCurrency(c.moneyAmount)} + ${c.grainQuantityKg} KG ${c.grainType}`}
                  </td>
                  <td className="py-2.5 px-4 text-right font-extrabold text-[#155e42]">
                    +{formatKg(c.equivalentKg)}
                  </td>
                  <td className="py-2.5 px-4 text-xs text-[#526359]">
                    {c.recordedByName || c.recordedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {contributions.length === 0 && (
          <div className="py-8 text-center text-xs text-[#526359]">
            No contributions recorded for this class yet.
          </div>
        )}
      </div>
    </div>
  );
}
