'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicLeaderboardItem, PublicStudentLeaderboardEntry } from '@/lib/types';
import { formatKg } from '@/lib/utils';
import {
  Trophy,
  Medal,
  Award,
  Search,
  Users,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  UserCheck,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface LeaderboardProps {
  items: PublicLeaderboardItem[];
}

export function Leaderboard({ items }: LeaderboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [classStudents, setClassStudents] = useState<Record<string, PublicStudentLeaderboardEntry[]>>({});
  const [loadingClass, setLoadingClass] = useState<string | null>(null);

  // Sort items by rank
  const sorted = [...items].sort((a, b) => a.rank - b.rank);

  // Separate top 3 podium
  const top1 = sorted.find((i) => i.rank === 1);
  const top2 = sorted.find((i) => i.rank === 2);
  const top3 = sorted.find((i) => i.rank === 3);

  // Filtered remaining list
  const filtered = sorted.filter(
    (i) =>
      i.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.year.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function toggleExpand(classId: string) {
    if (expandedClassId === classId) {
      setExpandedClassId(null);
      return;
    }

    setExpandedClassId(classId);

    // Fetch class students if not already cached
    if (!classStudents[classId]) {
      try {
        setLoadingClass(classId);
        const res = await fetch(`/api/leaderboard/class?classId=${classId}`);
        const data = await res.json();
        if (res.ok && data.leaderboard) {
          setClassStudents((prev) => ({
            ...prev,
            [classId]: data.leaderboard.students || [],
          }));
        }
      } catch (e) {
        console.error('Failed to load class students:', e);
      } finally {
        setLoadingClass(null);
      }
    }
  }

  return (
    <section id="leaderboard" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#155e42]/10 text-[#155e42] text-xs font-bold uppercase tracking-wider mb-3">
          <Trophy className="w-4 h-4 text-amber-500" />
          Official Department Competition
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a241b]">
          Main 17-Class Leaderboard
        </h2>
        <p className="mt-3 text-[#526359] text-base">
          All 17 classes compete in one unified leaderboard based on official Equivalent Impact KG. Click any class to view the continuous contributing students leaderboard.
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
        {/* 2nd Place (Silver) */}
        {top2 && (
          <Link
            href={`/class/${top2.classId}`}
            className="order-2 md:order-1 block rounded-3xl p-6 border-2 transition-card podium-silver relative overflow-hidden group shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="w-10 h-10 rounded-2xl bg-slate-300 text-slate-800 font-black text-lg flex items-center justify-center shadow-inner">
                2
              </span>
              <Medal className="w-8 h-8 text-slate-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{top2.className}</h3>
            <span className="text-xs text-slate-600 font-medium">{top2.program}</span>

            <div className="mt-6 pt-4 border-t border-slate-300/60 flex justify-between items-baseline">
              <div>
                <span className="text-xs text-slate-600 block">Class Impact</span>
                <span className="text-2xl font-black text-slate-900">{formatKg(top2.impactKg)}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-600 block">Contributors</span>
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1 justify-end">
                  <Users className="w-3.5 h-3.5" />
                  {top2.contributorCount}
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* 1st Place (Gold) */}
        {top1 && (
          <Link
            href={`/class/${top1.classId}`}
            className="order-1 md:order-2 block rounded-3xl p-8 border-2 transition-card podium-gold relative overflow-hidden group shadow-xl md:-translate-y-4"
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-400/20 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 font-black text-2xl flex items-center justify-center shadow-md">
                1
              </span>
              <Trophy className="w-10 h-10 text-amber-500 group-hover:scale-110 transition-transform animate-pulse" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400/30 text-amber-900 text-xs font-bold uppercase tracking-wider mb-1">
              🥇 Current Leader
            </div>
            <h3 className="text-3xl font-extrabold text-amber-950 mb-1">{top1.className}</h3>
            <span className="text-xs text-amber-900/80 font-medium">{top1.program}</span>

            <div className="mt-8 pt-4 border-t border-amber-400/60 flex justify-between items-baseline">
              <div>
                <span className="text-xs text-amber-800 block">Class Impact</span>
                <span className="text-3xl font-black text-amber-950">{formatKg(top1.impactKg)}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-amber-800 block">Contributors</span>
                <span className="text-base font-bold text-amber-950 flex items-center gap-1 justify-end">
                  <Users className="w-4 h-4" />
                  {top1.contributorCount}
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* 3rd Place (Bronze) */}
        {top3 && (
          <Link
            href={`/class/${top3.classId}`}
            className="order-3 block rounded-3xl p-6 border-2 transition-card podium-bronze relative overflow-hidden group shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="w-10 h-10 rounded-2xl bg-amber-700/20 text-amber-900 font-black text-lg flex items-center justify-center shadow-inner">
                3
              </span>
              <Award className="w-8 h-8 text-amber-700 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold text-amber-950 mb-1">{top3.className}</h3>
            <span className="text-xs text-amber-900/80 font-medium">{top3.program}</span>

            <div className="mt-6 pt-4 border-t border-amber-700/30 flex justify-between items-baseline">
              <div>
                <span className="text-xs text-amber-800 block">Class Impact</span>
                <span className="text-2xl font-black text-amber-950">{formatKg(top3.impactKg)}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-amber-800 block">Contributors</span>
                <span className="text-sm font-bold text-amber-950 flex items-center gap-1 justify-end">
                  <Users className="w-3.5 h-3.5" />
                  {top3.contributorCount}
                </span>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Search & Continuous Standings Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#e6e2d8]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-[#0a241b] flex items-center gap-2">
              <span>All 17 Classes Standings</span>
              <span className="text-xs font-normal text-[#526359]">({sorted.length} total classes)</span>
            </h3>
            <p className="text-xs text-[#526359] mt-0.5">
              Click any class row to expand its continuous student leaderboard.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search class or program..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-[#e6e2d8] focus:outline-none focus:ring-2 focus:ring-[#155e42] bg-[#fbfaf7]"
            />
          </div>
        </div>

        {/* Classes Table / Continuous List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e6e2d8] text-[#526359] text-xs uppercase tracking-wider">
                <th className="py-3 px-4 w-16 text-center">Rank</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4 hidden sm:table-cell">Program</th>
                <th className="py-3 px-4 text-right">Contributors</th>
                <th className="py-3 px-4 text-right">Impact Score</th>
                <th className="py-3 px-4 w-28 text-center">Roster</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f1eb]">
              {filtered.map((item) => {
                const isTop3 = item.rank <= 3;
                const isExpanded = expandedClassId === item.classId;
                const students = classStudents[item.classId] || [];

                return (
                  <React.Fragment key={item.classId}>
                    <tr
                      onClick={() => toggleExpand(item.classId)}
                      className={`hover:bg-[#fbfaf7] transition-colors group cursor-pointer ${
                        item.rank === 1
                          ? 'bg-amber-50/40'
                          : item.rank === 2
                          ? 'bg-slate-50/40'
                          : item.rank === 3
                          ? 'bg-amber-50/20'
                          : ''
                      } ${isExpanded ? 'bg-emerald-50/30' : ''}`}
                    >
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                            item.rank === 1
                              ? 'bg-amber-400 text-amber-950 shadow-xs'
                              : item.rank === 2
                              ? 'bg-slate-300 text-slate-800'
                              : item.rank === 3
                              ? 'bg-amber-700/20 text-amber-900'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.rank}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-[#0a241b]">
                        <div className="flex items-center gap-2">
                          <span>{item.className}</span>
                          {isTop3 && (
                            <span className="text-xs font-normal">
                              {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-[#526359] hidden sm:table-cell">
                        {item.program} ({item.year})
                      </td>
                      <td className="py-4 px-4 text-right text-[#526359] font-medium">
                        {item.contributorCount}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-extrabold text-[#155e42] text-base">
                          {formatKg(item.impactKg)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.classId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#155e42]/10 hover:bg-[#155e42]/20 text-[#155e42] transition-colors"
                          >
                            <span>{isExpanded ? 'Hide' : 'Roster'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <Link
                            href={`/class/${item.classId}`}
                            className="p-1 rounded-lg text-gray-400 hover:text-[#155e42] transition-colors"
                            title="Open full class page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED CONTINUOUS STUDENT LEADERBOARD LIST */}
                    {isExpanded && (
                      <tr className="bg-emerald-50/20">
                        <td colSpan={6} className="p-4 sm:p-6">
                          <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e6e2d8]">
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-[#155e42]" />
                                <h4 className="font-bold text-sm text-[#0a241b]">
                                  {item.className} • Student Contributors Leaderboard
                                </h4>
                              </div>
                              <Link
                                href={`/class/${item.classId}`}
                                className="text-xs font-semibold text-[#155e42] hover:underline flex items-center gap-1"
                              >
                                <span>Open Full Class Page</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>

                            {/* Privacy Notice */}
                            <div className="flex items-center gap-2 text-[11px] text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 mb-4">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                              <span>
                                In accordance with privacy rules, individual contribution amounts are confidential. Only student names and ranks are displayed.
                              </span>
                            </div>

                            {loadingClass === item.classId ? (
                              <div className="py-6 text-center text-xs text-[#526359]">
                                Loading class leaderboard...
                              </div>
                            ) : students.length > 0 ? (
                              <div className="overflow-x-auto rounded-xl border border-[#e6e2d8]">
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="bg-[#fbfaf7] text-[#526359] text-[10px] uppercase font-bold border-b border-[#e6e2d8]">
                                      <th className="py-2.5 px-3 w-14 text-center">Rank</th>
                                      <th className="py-2.5 px-3">Student Name</th>
                                      <th className="py-2.5 px-3 text-right">Class</th>
                                      <th className="py-2.5 px-3 text-right">Standing</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#f4f1eb]">
                                    {students.map((st) => (
                                      <tr key={`${st.rank}-${st.name}`} className="hover:bg-[#fbfaf7]">
                                        <td className="py-2 px-3 text-center">
                                          <span
                                            className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold ${
                                              st.rank === 1
                                                ? 'bg-amber-400 text-amber-950'
                                                : st.rank === 2
                                                ? 'bg-slate-300 text-slate-800'
                                                : st.rank === 3
                                                ? 'bg-amber-700/20 text-amber-900'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}
                                          >
                                            {st.rank}
                                          </span>
                                        </td>
                                        <td className="py-2 px-3 font-semibold text-[#0a241b]">
                                          {st.name}
                                        </td>
                                        <td className="py-2 px-3 text-right text-gray-500">
                                          {item.className}
                                        </td>
                                        <td className="py-2 px-3 text-right font-medium">
                                          {st.rank === 1 ? (
                                            <span className="text-amber-800 font-bold">🥇 1st in Class</span>
                                          ) : st.rank <= 3 ? (
                                            <span className="text-slate-800 font-bold">Top 3</span>
                                          ) : (
                                            <span className="text-emerald-700">Contributing Student</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="py-4 text-center text-xs text-[#526359]">
                                No student contributions logged for this class yet.
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-[#526359]">
            <p>No classes matched "{searchTerm}".</p>
          </div>
        )}
      </div>
    </section>
  );
}
