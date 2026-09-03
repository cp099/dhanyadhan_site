import Link from 'next/link';
import { getAllClasses } from '@/lib/firebase/admin';
import { formatKg, formatCurrency } from '@/lib/utils';
import { GraduationCap, Trophy, Users, ArrowRight, UserCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminClassesPage() {
  const classes = await getAllClasses();
  const sorted = [...classes].sort((a, b) => a.currentRank - b.currentRank);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs">
        <h2 className="text-2xl font-black text-[#0a241b] flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-[#155e42]" />
          17 Commerce Classes Administration
        </h2>
        <p className="text-xs text-[#526359] mt-1">
          Complete operational directory of all 17 classes, their assigned Class Representatives, and aggregate performance.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#e6e2d8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e6e2d8] text-[#526359] text-xs uppercase tracking-wider bg-[#fbfaf7]">
                <th className="py-3 px-4 text-center">Rank</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Program & Year</th>
                <th className="py-3 px-4">Assigned CR</th>
                <th className="py-3 px-4 text-right">Physical Grain</th>
                <th className="py-3 px-4 text-right">Money Raised</th>
                <th className="py-3 px-4 text-right">Equivalent Impact</th>
                <th className="py-3 px-4 text-right">Contributors</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f1eb]">
              {sorted.map((c) => (
                <tr key={c.id} className="hover:bg-[#fbfaf7] transition-colors">
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                        c.currentRank === 1
                          ? 'bg-amber-400 text-amber-950'
                          : c.currentRank === 2
                          ? 'bg-slate-300 text-slate-800'
                          : c.currentRank === 3
                          ? 'bg-amber-700/20 text-amber-900'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      #{c.currentRank}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#0a241b]">
                    <Link
                      href={`/admin/classes/${c.id}`}
                      className="hover:text-[#155e42] transition-colors"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#526359]">
                    {c.program} ({c.year})
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    {c.crName ? (
                      <div>
                        <span className="font-semibold text-[#0a241b] block">{c.crName}</span>
                        <span className="text-[11px] text-[#526359]">{c.crEmail}</span>
                      </div>
                    ) : (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right text-xs text-amber-900 font-semibold">
                    {formatKg(c.totalGrainKg)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-xs text-emerald-700 font-semibold">
                    {formatCurrency(c.totalMoney)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-[#155e42]">
                    {formatKg(c.totalEquivalentKg)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-xs font-medium text-[#526359]">
                    {c.contributorCount} students
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Link
                      href={`/admin/classes/${c.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#155e42] text-white text-xs font-semibold hover:bg-[#0a241b] transition-colors shadow-2xs"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
