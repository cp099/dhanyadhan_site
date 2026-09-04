'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ClassDoc } from '@/lib/types';
import { formatKg, formatCurrency } from '@/lib/utils';
import {
  Search,
  Download,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Users,
} from 'lucide-react';

interface MasterAuditTableProps {
  classes: ClassDoc[];
}

export function MasterAuditTable({ classes }: MasterAuditTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<'All' | 'Year 1' | 'Year 2' | 'Year 3' | 'Masters'>('All');

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchesYear = selectedYear === 'All' || c.year === selectedYear;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(term) ||
        c.program.toLowerCase().includes(term) ||
        (c.crName && c.crName.toLowerCase().includes(term));
      return matchesYear && matchesSearch;
    });
  }, [classes, searchTerm, selectedYear]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Rank', 'Class Name', 'Year', 'Program', 'Equivalent Impact KG', 'Grain KG', 'Monetary INR', 'Contributors', 'CR Name'];
    const rows = filteredClasses.map((c) => [
      c.currentRank,
      `"${c.name}"`,
      `"${c.year}"`,
      `"${c.program}"`,
      c.totalEquivalentKg,
      c.totalGrainKg,
      c.totalMoney,
      c.contributorCount,
      `"${c.crName || 'Unassigned'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dhanyadhan_class_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e6e2d8] ambient-shadow overflow-hidden flex flex-col h-full">
      {/* Table Header & Search Tools */}
      <div className="bg-[#fcf9f3] px-6 py-4 border-b border-[#e6e2d8] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-black font-headline text-[#0a241b] flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#155e42]" />
            <span>Master Class Audit Roster</span>
            <span className="text-xs text-[#526359] font-normal font-sans">
              ({filteredClasses.length} of {classes.length})
            </span>
          </h2>
          <p className="text-xs text-[#526359] mt-0.5">
            Real-time compliance monitoring and telemetry for all 17 cohort streams.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search class or CR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#e6e2d8] rounded-full pl-9 pr-3 py-1.5 text-xs text-[#0a241b] placeholder:text-gray-400 focus:border-[#155e42] focus:ring-1 focus:ring-[#155e42] outline-none transition-all"
            />
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="p-2 rounded-xl text-[#526359] hover:text-[#0a241b] hover:bg-[#f0eee8] transition-colors border border-[#e6e2d8] bg-white flex-shrink-0"
            title="Export CSV Audit"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cohort Year Filter Tabs */}
      <div className="px-6 py-3 border-b border-[#e6e2d8] bg-white flex gap-2 overflow-x-auto no-scrollbar">
        {(['All', 'Year 1', 'Year 2', 'Year 3', 'Masters'] as const).map((tab) => {
          const isActive = selectedYear === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedYear(tab)}
              className={`shrink-0 px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#0a241b] text-white shadow-xs'
                  : 'bg-[#fcf9f3] text-[#526359] hover:bg-[#f0eee8] border border-[#e6e2d8]'
              }`}
            >
              {tab === 'All' ? 'All Classes' : tab}
            </button>
          );
        })}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="text-[11px] font-bold uppercase tracking-wider text-[#526359] bg-[#fcf9f3] border-b border-[#e6e2d8]">
              <th className="py-3 px-5 text-center w-14">Rank</th>
              <th className="py-3 px-5">Class & Cohort</th>
              <th className="py-3 px-5 text-right">Equivalent Impact</th>
              <th className="py-3 px-5 text-right hidden md:table-cell">Food Grains</th>
              <th className="py-3 px-5 text-right hidden md:table-cell">Monetary</th>
              <th className="py-3 px-5 text-center">Contributors</th>
              <th className="py-3 px-5 text-center">Audit Status</th>
              <th className="py-3 px-5 text-center w-16">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f4f1eb]">
            {filteredClasses.map((c) => {
              return (
                <tr
                  key={c.id}
                  className="hover:bg-[#fcf9f3] transition-colors group"
                >
                  {/* Rank */}
                  <td className="py-3.5 px-5 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black font-headline ${
                        c.currentRank === 1
                          ? 'bg-amber-400 text-amber-950 shadow-2xs'
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

                  {/* Class Name & CR */}
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-sm text-[#0a241b] group-hover:text-[#155e42] transition-colors">
                      {c.name}
                    </div>
                    <div className="text-[11px] text-[#526359] flex items-center gap-1.5 mt-0.5">
                      <span>{c.year}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full inline-block" />
                      <span>{c.program}</span>
                      {c.crName && (
                        <>
                          <span className="w-1 h-1 bg-gray-300 rounded-full inline-block" />
                          <span className="text-[#155e42] font-semibold">CR: {c.crName}</span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Equivalent Impact */}
                  <td className="py-3.5 px-5 text-right">
                    <span className="font-black font-headline text-sm text-[#155e42]">
                      {formatKg(c.totalEquivalentKg)}
                    </span>
                  </td>

                  {/* Food Grains */}
                  <td className="py-3.5 px-5 text-right hidden md:table-cell text-gray-700 font-medium">
                    {formatKg(c.totalGrainKg)}
                  </td>

                  {/* Monetary */}
                  <td className="py-3.5 px-5 text-right hidden md:table-cell text-gray-700 font-medium">
                    {formatCurrency(c.totalMoney)}
                  </td>

                  {/* Contributors */}
                  <td className="py-3.5 px-5 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-[#0a241b]">
                      <Users className="w-3 h-3 text-gray-400" />
                      {c.contributorCount}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-5 text-center">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Active & Synced
                    </span>
                  </td>

                  {/* Inspect Link */}
                  <td className="py-3.5 px-5 text-center">
                    <Link
                      href={`/admin/classes/${c.id}`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#155e42] hover:bg-[#f0eee8] transition-colors inline-block"
                      title="Inspect Class & Students"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredClasses.length === 0 && (
          <div className="py-12 text-center text-xs text-[#526359]">
            No classes matched your search or filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
