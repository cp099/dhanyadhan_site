'use client';

import React, { useState } from 'react';
import { OFFICIAL_CLASSES } from '@/lib/constants';
import {
  FileSpreadsheet,
  Download,
  Building,
  GraduationCap,
  Users,
  History,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [selectedClass, setSelectedClass] = useState(OFFICIAL_CLASSES[0].id);

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs">
        <h2 className="text-2xl font-black text-[#0a241b] flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-[#155e42]" />
          SDG Cell Institutional Reporting & Exports
        </h2>
        <p className="text-xs text-[#526359] mt-1">
          Generate comprehensive audit and progress reports. All reports can be downloaded in standard CSV format for institutional archiving and spreadsheet analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Department Summary Report */}
        <div className="bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#155e42]/10 flex items-center justify-center text-[#155e42] mb-4">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0a241b] mb-1">
              Department Master Report
            </h3>
            <p className="text-xs text-[#526359] leading-relaxed mb-6">
              Department-wide totals, target progress percentage, monetary contributions, physical grain collections, and full rankings across all 17 classes.
            </p>
          </div>

          <a
            href="/api/reports/export?type=department"
            download
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#155e42] text-white font-bold text-xs hover:bg-[#0a241b] transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-[#86efac]" />
            Download Department Report (CSV)
          </a>
        </div>

        {/* 2. All Contributions Transaction Report */}
        <div className="bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700 mb-4">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0a241b] mb-1">
              Complete Contribution Ledger
            </h3>
            <p className="text-xs text-[#526359] leading-relaxed mb-6">
              Every individual transaction recorded in the system, including timestamps, student identities, grain types, money amounts, official calculated equivalent KG, and recording administrator.
            </p>
          </div>

          <a
            href="/api/reports/export?type=contribution"
            download
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#155e42] text-white font-bold text-xs hover:bg-[#0a241b] transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-[#86efac]" />
            Download Contributions Ledger (CSV)
          </a>
        </div>

        {/* 3. Class-Specific Student Report */}
        <div className="bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-700 mb-4">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0a241b] mb-1">
              Class Student Breakdown Report
            </h3>
            <p className="text-xs text-[#526359] leading-relaxed mb-4">
              Detailed breakdown of an individual class containing all student names, cumulative grain, cumulative money, and total equivalent impact.
            </p>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#526359] mb-1">
                Select Class:
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#e6e2d8] rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#155e42] focus:outline-none"
              >
                {OFFICIAL_CLASSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.year} - {c.program})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <a
            href={`/api/reports/export?type=class&classId=${selectedClass}`}
            download
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#155e42] text-white font-bold text-xs hover:bg-[#0a241b] transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-[#86efac]" />
            Download {selectedClass} Report (CSV)
          </a>
        </div>

        {/* 4. Class Transactions Sub-Report */}
        <div className="bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-700 mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0a241b] mb-1">
              Class-Filtered Transactions
            </h3>
            <p className="text-xs text-[#526359] leading-relaxed mb-6">
              Export all transactions logged specifically for <strong>{selectedClass}</strong> to cross-verify against physical grain collection bins and receipt vouchers.
            </p>
          </div>

          <a
            href={`/api/reports/export?type=contribution&classId=${selectedClass}`}
            download
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#155e42] text-[#155e42] hover:bg-[#155e42]/5 font-bold text-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Download {selectedClass} Ledger (CSV)
          </a>
        </div>
      </div>
    </div>
  );
}
