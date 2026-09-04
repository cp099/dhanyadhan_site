'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { StudentDoc } from '@/lib/types';
import { formatKg } from '@/lib/utils';
import {
  Search,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  Download,
  Filter,
} from 'lucide-react';

interface CrStudentRosterTableProps {
  students: StudentDoc[];
  classId: string;
}

export function CrStudentRosterTable({ students, classId }: CrStudentRosterTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'contributed' | 'pending'>('all');

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const hasContributed = (s.contributionCount || 0) > 0;
      if (statusFilter === 'contributed' && !hasContributed) return false;
      if (statusFilter === 'pending' && hasContributed) return false;

      const term = searchTerm.toLowerCase();
      const matchesName = s.name.toLowerCase().includes(term);
      const matchesRoll = s.rollNo ? s.rollNo.toLowerCase().includes(term) : false;
      return matchesName || matchesRoll;
    });
  }, [students, searchTerm, statusFilter]);

  // Export Roster CSV
  const handleExportCSV = () => {
    const headers = ['Roll No', 'Student Name', 'Status', 'Contributions Count'];
    const rows = filteredStudents.map((s) => [
      `"${s.rollNo || ''}"`,
      `"${s.name}"`,
      s.contributionCount > 0 ? 'Contributed' : 'Pending',
      s.contributionCount || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${classId}_students_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const contributedCount = students.filter((s) => (s.contributionCount || 0) > 0).length;

  return (
    <div className="bg-white rounded-3xl border border-[#e6e2d8] ambient-shadow overflow-hidden flex flex-col">
      {/* Table Header */}
      <div className="bg-[#fcf9f3] px-6 py-4 border-b border-[#e6e2d8] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-black font-headline text-[#0a241b] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#155e42]" />
            <span>Class Student Roster</span>
            <span className="text-xs text-[#526359] font-normal font-sans">
              ({contributedCount}/{students.length} Participated)
            </span>
          </h3>
          <p className="text-xs text-[#526359] mt-0.5">
            Student participation telemetry and quick contribution shortcuts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name or roll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#e6e2d8] rounded-full pl-9 pr-3 py-1.5 text-xs text-[#0a241b] placeholder:text-gray-400 focus:border-[#155e42] focus:ring-1 focus:ring-[#155e42] outline-none transition-all"
            />
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="p-2 rounded-xl text-[#526359] hover:text-[#0a241b] hover:bg-[#f0eee8] transition-colors border border-[#e6e2d8] bg-white flex-shrink-0"
            title="Download Class Roster CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 py-2.5 border-b border-[#e6e2d8] bg-white flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex gap-2">
          {(['all', 'contributed', 'pending'] as const).map((filter) => {
            const isActive = statusFilter === filter;
            const label =
              filter === 'all'
                ? `All (${students.length})`
                : filter === 'contributed'
                ? `Contributed (${contributedCount})`
                : `Pending (${students.length - contributedCount})`;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#0a241b] text-white shadow-2xs'
                    : 'bg-[#fcf9f3] text-[#526359] hover:bg-[#f0eee8] border border-[#e6e2d8]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <Link
          href="/cr/students"
          className="text-xs font-bold text-[#155e42] hover:underline whitespace-nowrap hidden sm:block"
        >
          Manage Full Roster →
        </Link>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="text-[11px] font-bold uppercase tracking-wider text-[#526359] bg-[#fcf9f3] border-b border-[#e6e2d8]">
              <th className="py-3 px-5 w-24">Roll No</th>
              <th className="py-3 px-5">Student Name</th>
              <th className="py-3 px-5 text-center">Contributions</th>
              <th className="py-3 px-5 text-center">Status</th>
              <th className="py-3 px-5 text-right w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f4f1eb]">
            {filteredStudents.map((s) => {
              const hasContributed = (s.contributionCount || 0) > 0;
              return (
                <tr key={s.id} className="hover:bg-[#fcf9f3] transition-colors group">
                  <td className="py-3.5 px-5 font-mono text-[11px] text-gray-500">
                    {s.rollNo || '—'}
                  </td>
                  <td className="py-3.5 px-5 font-bold text-sm text-[#0a241b]">
                    {s.name}
                  </td>
                  <td className="py-3.5 px-5 text-center font-semibold text-gray-700">
                    {s.contributionCount || 0}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    {hasContributed ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Participated
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-600 border border-gray-200 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                        <Clock className="w-3 h-3 text-gray-400" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      href={`/cr/contributions/new?studentId=${s.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#155e42]/10 hover:bg-[#155e42] text-[#155e42] hover:text-white font-bold text-[11px] transition-all"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Log</span>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <div className="py-10 text-center text-xs text-[#526359]">
            No students found matching your filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
