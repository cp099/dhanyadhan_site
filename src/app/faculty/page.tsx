'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FacultyDoc, ContributionDoc } from '@/lib/types';
import { formatKg, formatCurrency, formatDate } from '@/lib/utils';
import PaymentProofModal from '@/components/ui/PaymentProofModal';
import {
  GraduationCap,
  PlusCircle,
  History,
  Users,
  Award,
  Wheat,
  Coins,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function FacultyOverviewPage() {
  const [faculty, setFaculty] = useState<FacultyDoc[]>([]);
  const [contributions, setContributions] = useState<ContributionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Proof Modal
  const [proofModalTarget, setProofModalTarget] = useState<ContributionDoc | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [facRes, contrRes] = await Promise.all([
          fetch('/api/faculty'),
          fetch('/api/faculty/contributions'),
        ]);

        const facData = await facRes.json();
        const contrData = await contrRes.json();

        if (facData.faculty) setFaculty(facData.faculty);
        if (contrData.contributions) setContributions(contrData.contributions);
      } catch (err: any) {
        setError(err.message || 'Failed to load faculty dashboard.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Metrics
  const activeFaculty = faculty.filter((f) => f.active);
  const contributingFaculty = activeFaculty.filter((f) => f.contributionCount > 0);
  const totalEquivalentKg = Math.round(
    activeFaculty.reduce((acc, f) => acc + (f.totalEquivalentKg || 0), 0) * 100
  ) / 100;
  const totalGrainKg = Math.round(
    activeFaculty.reduce((acc, f) => acc + (f.totalGrainKg || 0), 0) * 100
  ) / 100;
  const totalMoney = Math.round(
    activeFaculty.reduce((acc, f) => acc + (f.totalMoney || 0), 0) * 100
  ) / 100;

  // Top contributors
  const topContributors = [...activeFaculty]
    .filter((f) => f.totalEquivalentKg > 0)
    .sort((a, b) => b.totalEquivalentKg - a.totalEquivalentKg)
    .slice(0, 5);

  // Recent 5 contributions
  const recentContributions = contributions.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0a241b] to-[#155e42] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold backdrop-blur-xs border border-white/10">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Department of Commerce • Faculty Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-headline tracking-tight">
            Faculty Contributions & Impact Hub
          </h1>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
            Record and recognize food grain and monetary support from professors, instructors, and staff members across the Department of Commerce.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 relative z-10">
          <Link
            href="/faculty/contributions/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#0a241b] text-xs font-bold shadow-md hover:bg-emerald-50 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-[#155e42]" />
            <span>Record Faculty Contribution</span>
          </Link>
          <Link
            href="/faculty/contributions"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors"
          >
            <History className="w-4 h-4" />
            <span>View Faculty Ledger</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-[#e6e2d8] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#526359]">
            <span className="text-xs font-bold uppercase tracking-wider">Faculty Roster</span>
            <Users className="w-4 h-4 text-blue-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#0a241b]">{activeFaculty.length}</span>
            <span className="text-xs text-gray-500">Professors</span>
          </div>
          <div className="text-[11px] text-gray-500">
            <strong>{contributingFaculty.length}</strong> active contributors ({activeFaculty.length ? Math.round((contributingFaculty.length / activeFaculty.length) * 100) : 0}%)
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#e6e2d8] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#526359]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Faculty Impact</span>
            <Award className="w-4 h-4 text-[#155e42]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#155e42]">
              +{formatKg(totalEquivalentKg)}
            </span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Combined grain & money equivalent</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#e6e2d8] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#526359]">
            <span className="text-xs font-bold uppercase tracking-wider">Food Grains</span>
            <Wheat className="w-4 h-4 text-amber-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-950">
              {formatKg(totalGrainKg)}
            </span>
          </div>
          <div className="text-[11px] text-gray-500">Physical grain packages collected</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#e6e2d8] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#526359]">
            <span className="text-xs font-bold uppercase tracking-wider">Monetary Support</span>
            <Coins className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-900">
              {formatCurrency(totalMoney)}
            </span>
          </div>
          <div className="text-[11px] text-gray-500">Verified digital bank / UPI transfers</div>
        </div>
      </div>

      {/* Split View: Top Faculty Contributors & Recent Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* TOP CONTRIBUTORS LEADERBOARD */}
        <div className="bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0ede6]">
            <div>
              <h3 className="text-base font-black font-headline text-[#0a241b] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#155e42]" />
                Top Faculty Contributors
              </h3>
              <p className="text-xs text-[#526359]">Distinguished donors from the Department of Commerce</p>
            </div>
            <Link
              href="/faculty/roster"
              className="text-xs font-bold text-[#155e42] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#f4f1eb]">
            {topContributors.map((prof, idx) => (
              <div key={prof.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                      idx === 0
                        ? 'bg-amber-100 text-amber-900 font-extrabold'
                        : idx === 1
                        ? 'bg-gray-200 text-gray-800'
                        : idx === 2
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'text-gray-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-[#0a241b] block truncate">{prof.name}</span>
                    <span className="text-[11px] text-[#526359] truncate block">{prof.designation}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="font-black text-xs text-[#155e42] block">
                    +{formatKg(prof.totalEquivalentKg)}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {prof.contributionCount} {prof.contributionCount === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
              </div>
            ))}

            {topContributors.length === 0 && (
              <div className="py-8 text-center text-xs text-gray-400">
                No faculty contributions recorded yet. Be the first to log an entry!
              </div>
            )}
          </div>
        </div>

        {/* RECENT TRANSACTIONS STREAM */}
        <div className="bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0ede6]">
            <div>
              <h3 className="text-base font-black font-headline text-[#0a241b] flex items-center gap-2">
                <History className="w-4 h-4 text-blue-700" />
                Recent Faculty Contributions
              </h3>
              <p className="text-xs text-[#526359]">Latest records saved to the faculty ledger</p>
            </div>
            <Link
              href="/faculty/contributions"
              className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
            >
              <span>Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#f4f1eb]">
            {recentContributions.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#0a241b] truncate">
                      {c.facultyName || 'Faculty Member'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                      {c.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#526359] mt-0.5 flex items-center gap-2">
                    <span>{formatDate(c.createdAt)}</span>
                    {c.notes && <span className="truncate italic max-w-[150px]">({c.notes})</span>}
                  </div>
                </div>

                <div className="text-right flex items-center gap-2 flex-shrink-0">
                  <div>
                    <span className="font-black text-xs text-[#155e42] block">
                      +{formatKg(c.equivalentKg)}
                    </span>
                    {c.type === 'money' && (
                      <span className="text-[10px] text-emerald-800 font-semibold">
                        {formatCurrency(c.moneyAmount)}
                      </span>
                    )}
                  </div>
                  {c.paymentProofUrl && (
                    <button
                      type="button"
                      onClick={() => setProofModalTarget(c)}
                      className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="View Payment Proof"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {recentContributions.length === 0 && (
              <div className="py-8 text-center text-xs text-gray-400">
                No transactions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Proof Modal */}
      {proofModalTarget && (
        <PaymentProofModal
          isOpen={!!proofModalTarget}
          onClose={() => setProofModalTarget(null)}
          proofUrl={proofModalTarget.paymentProofUrl}
          studentName={proofModalTarget.facultyName || 'Faculty Member'}
          classId="Department Faculty"
          moneyAmount={proofModalTarget.moneyAmount}
          equivalentKg={proofModalTarget.equivalentKg}
          createdAt={proofModalTarget.createdAt}
          recordedBy={proofModalTarget.recordedByName || proofModalTarget.recordedBy}
          notes={proofModalTarget.notes}
        />
      )}
    </div>
  );
}
