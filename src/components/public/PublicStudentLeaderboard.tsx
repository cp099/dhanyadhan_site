import React from 'react';
import { PublicStudentLeaderboardEntry } from '@/lib/types';
import { ShieldCheck, UserCheck } from 'lucide-react';

interface PublicStudentLeaderboardProps {
  students: PublicStudentLeaderboardEntry[];
  className: string;
}

export function PublicStudentLeaderboard({
  students,
  className,
}: PublicStudentLeaderboardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#e6e2d8]">
      {/* Header & Privacy Notice */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#0a241b] flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-[#155e42]" />
          <span>{className} • Contributing Students</span>
        </h3>
        <p className="text-xs text-[#526359] mt-1">
          Honoring participating students in order of cumulative impact.
        </p>

        {/* Institutional Privacy Guarantee Banner */}
        <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-start gap-2 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Privacy Protection:</strong> In accordance with the campaign ethics policy, individual donation amounts, grain weights, and transaction histories are strictly confidential. Only student names and relative class ranks are displayed.
          </span>
        </div>
      </div>

      {/* Public Student List (Rank & Name ONLY) */}
      {students.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {students.map((entry) => (
            <div
              key={`${entry.rank}-${entry.name}`}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#fbfaf7] border border-[#e6e2d8] hover:border-[#155e42]/50 transition-colors"
            >
              <span
                className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 ${
                  entry.rank === 1
                    ? 'bg-amber-400 text-amber-950 shadow-xs'
                    : entry.rank === 2
                    ? 'bg-slate-300 text-slate-800'
                    : entry.rank === 3
                    ? 'bg-amber-700/20 text-amber-900'
                    : 'bg-[#e6e2d8] text-[#526359]'
                }`}
              >
                {entry.rank}
              </span>
              <span className="font-semibold text-sm text-[#0a241b] truncate">
                {entry.name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-[#526359] bg-[#fbfaf7] rounded-2xl border border-dashed border-[#e6e2d8]">
          <p className="text-sm font-medium">No contributions recorded for this class yet.</p>
          <p className="text-xs text-gray-400 mt-1">
            Contributions logged by the Class Representative will appear here dynamically.
          </p>
        </div>
      )}
    </div>
  );
}
