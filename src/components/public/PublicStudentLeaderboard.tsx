'use client';

import React, { useState } from 'react';
import { PublicStudentLeaderboardEntry } from '@/lib/types';
import { ShieldCheck, UserCheck, Search, Trophy, Medal, Award } from 'lucide-react';

interface PublicStudentLeaderboardProps {
  students: PublicStudentLeaderboardEntry[];
  className: string;
}

export function PublicStudentLeaderboard({
  students,
  className,
}: PublicStudentLeaderboardProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Deterministically sorted by rank
  const sorted = [...students].sort((a, b) => a.rank - b.rank);

  // Filtered by search
  const filtered = sorted.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#e6e2d8]">
      {/* Header & Privacy Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#0a241b] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#155e42]" />
            <span>{className} • Contributing Students Leaderboard</span>
          </h3>
          <p className="text-xs text-[#526359] mt-1">
            Official class ranking of contributing students in a continuous leaderboard list.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-[#e6e2d8] focus:outline-none focus:ring-2 focus:ring-[#155e42] bg-[#fbfaf7]"
          />
        </div>
      </div>

      {/* Institutional Privacy Guarantee Banner */}
      <div className="mb-6 p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900">
        <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Privacy Guarantee:</strong> Individual financial amounts and grain weights are strictly confidential. In accordance with the campaign guidelines, only student names and relative class ranks are displayed.
        </span>
      </div>

      {/* Continuous Ranking List Table */}
      {filtered.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-[#e6e2d8]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e6e2d8] text-[#526359] text-xs uppercase tracking-wider bg-[#fbfaf7]">
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4 text-right">Class Cohort</th>
                <th className="py-3.5 px-4 text-right">Honour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f1eb]">
              {filtered.map((entry) => {
                const isTop3 = entry.rank <= 3;
                return (
                  <tr
                    key={`${entry.rank}-${entry.name}`}
                    className={`hover:bg-[#fbfaf7] transition-colors ${
                      entry.rank === 1
                        ? 'bg-amber-50/40'
                        : entry.rank === 2
                        ? 'bg-slate-50/40'
                        : entry.rank === 3
                        ? 'bg-amber-50/20'
                        : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                          entry.rank === 1
                            ? 'bg-amber-400 text-amber-950 shadow-xs'
                            : entry.rank === 2
                            ? 'bg-slate-300 text-slate-800'
                            : entry.rank === 3
                            ? 'bg-amber-700/20 text-amber-900'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {entry.rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0a241b] flex items-center gap-2">
                      <span>{entry.name}</span>
                      {isTop3 && (
                        <span className="text-xs font-normal">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-[#526359]">
                      {className}
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs font-semibold">
                      {entry.rank === 1 && (
                        <span className="text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                          Class Leader
                        </span>
                      )}
                      {entry.rank === 2 && (
                        <span className="text-slate-800 bg-slate-200/70 px-2 py-0.5 rounded-md">
                          Top Contributor
                        </span>
                      )}
                      {entry.rank === 3 && (
                        <span className="text-amber-900 bg-amber-100/50 px-2 py-0.5 rounded-md">
                          Top Contributor
                        </span>
                      )}
                      {entry.rank > 3 && (
                        <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Active Contributor
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-[#526359] bg-[#fbfaf7] rounded-2xl border border-dashed border-[#e6e2d8]">
          <p className="text-sm font-medium">
            {searchTerm
              ? `No student matching "${searchTerm}" found in this class.`
              : 'No contributions recorded for this class yet.'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Contributions recorded by the Class Representative will automatically rank here.
          </p>
        </div>
      )}
    </div>
  );
}
