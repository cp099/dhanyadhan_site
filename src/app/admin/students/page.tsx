'use client';

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { StudentDoc, ClassMetadata } from '@/lib/types';
import { OFFICIAL_CLASSES } from '@/lib/constants';
import { formatKg, formatCurrency } from '@/lib/utils';
import {
  Users,
  Search,
  Filter,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  PlusCircle,
  Sparkles,
  X,
} from 'lucide-react';

interface CsvRow {
  'Student Name'?: string;
  Name?: string;
  'Class Name'?: string;
  Class?: string;
  'Roll No'?: string;
  Roll?: string;
}

interface ParsedPreview {
  valid: Array<{ name: string; classId: string; rollNo?: string }>;
  errors: string[];
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');

  // CSV Import Modal State
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [preview, setPreview] = useState<ParsedPreview | null>(null);
  const [importing, setImporting] = useState(false);

  // Seed state
  const [seeding, setSeeding] = useState(false);

  async function loadStudents() {
    try {
      setLoading(true);
      const res = await fetch('/api/students');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch students');
      setStudents(data.students || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  // Handle CSV file selection and client-side pre-validation
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setPreview(null);

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validRows: Array<{ name: string; classId: string; rollNo?: string }> = [];
        const errorRows: string[] = [];

        // Build mapping
        const classMap: Record<string, string> = {};
        OFFICIAL_CLASSES.forEach((c) => {
          classMap[c.name.toLowerCase()] = c.id;
          classMap[c.id.toLowerCase()] = c.id;
        });

        results.data.forEach((row, idx) => {
          const rawName = (row['Student Name'] || row.Name || '').trim();
          const rawClass = (row['Class Name'] || row.Class || '').trim().toLowerCase();
          const rollNo = (row['Roll No'] || row.Roll || '').trim();

          if (!rawName) {
            errorRows.push(`Row ${idx + 2}: Student name is empty.`);
            return;
          }

          const matchedClassId = classMap[rawClass];
          if (!matchedClassId) {
            errorRows.push(
              `Row ${idx + 2} (${rawName}): Unrecognized class "${row.Class || row['Class Name']}". Must match one of the 17 official classes.`
            );
            return;
          }

          validRows.push({
            name: rawName,
            classId: matchedClassId,
            rollNo: rollNo || undefined,
          });
        });

        setPreview({
          valid: validRows,
          errors: errorRows,
        });
      },
      error: (err) => {
        setError(`Failed to parse CSV file: ${err.message}`);
      },
    });
  }

  // Commit batch import to backend
  async function confirmImport() {
    if (!preview || preview.valid.length === 0) return;
    setImporting(true);
    setError(null);

    try {
      const res = await fetch('/api/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: preview.valid }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import students');

      setSuccessMsg(`Successfully imported ${data.importedCount} students across classes!`);
      setCsvModalOpen(false);
      setPreview(null);
      await loadStudents();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  // Seed sample demo students
  async function handleSeedDemo() {
    if (!confirm('This will seed 5 sample students for each of the 17 Commerce classes. Continue?')) {
      return;
    }
    setSeeding(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleStudentsPerClass: 5, applyDemoCampaignConfig: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Seed failed');

      setSuccessMsg(data.message || 'Seeded development students successfully.');
      await loadStudents();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSeeding(false);
    }
  }

  // Filter students
  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.rollNo && s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesClass = selectedClassFilter === 'all' || s.classId === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs">
        <div>
          <h2 className="text-2xl font-black text-[#0a241b] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#155e42]" />
            Master Student Rosters
          </h2>
          <p className="text-xs text-[#526359] mt-1">
            Total {students.length} preloaded students enrolled across all 17 Commerce classes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSeedDemo}
            disabled={seeding}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-950 text-xs font-bold hover:bg-amber-100 transition-colors shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            {seeding ? 'Seeding...' : 'Seed Sample Students'}
          </button>
          <button
            onClick={() => setCsvModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#155e42] text-white text-xs font-bold hover:bg-[#0a241b] transition-colors shadow-xs"
          >
            <Upload className="w-4 h-4 text-[#86efac]" />
            Import Roster CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-xs text-emerald-900">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e6e2d8] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student by name or roll no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-[#e6e2d8] rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#155e42] focus:outline-none"
          >
            <option value="all">All 17 Classes</option>
            {OFFICIAL_CLASSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.year})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-[#e6e2d8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e6e2d8] text-[#526359] text-xs uppercase tracking-wider bg-[#fbfaf7]">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4 text-right">Physical Grain</th>
                <th className="py-3 px-4 text-right">Money Raised</th>
                <th className="py-3 px-4 text-right">Equivalent Impact</th>
                <th className="py-3 px-4 text-center">Entries</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f1eb]">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-[#fbfaf7] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#0a241b]">{s.name}</td>
                  <td className="py-3 px-4 text-xs font-semibold text-[#155e42]">
                    {s.classId}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#526359]">{s.rollNo || '—'}</td>
                  <td className="py-3 px-4 text-right text-xs text-amber-900 font-semibold">
                    {formatKg(s.totalGrainKg)}
                  </td>
                  <td className="py-3 px-4 text-right text-xs text-emerald-700 font-semibold">
                    {formatCurrency(s.totalMoney)}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-[#155e42]">
                    {formatKg(s.totalEquivalentKg)}
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-[#526359]">
                    {s.contributionCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-xs text-[#526359]">
            {loading ? 'Loading students...' : 'No students found.'}
          </div>
        )}
      </div>

      {/* CSV IMPORT MODAL WITH PRE-VALIDATION */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 border border-[#e6e2d8] shadow-xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e2d8]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#155e42]" />
                <h3 className="text-lg font-bold text-[#0a241b]">Bulk Import Student Roster</h3>
              </div>
              <button
                onClick={() => {
                  setCsvModalOpen(false);
                  setPreview(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#526359] leading-relaxed">
              Upload a CSV file containing columns: <code>Student Name</code>, <code>Class</code> (matching any of the 17 official classes), and optional <code>Roll No</code>.
            </p>

            {/* File Input */}
            <div className="border-2 border-dashed border-[#e6e2d8] rounded-2xl p-6 text-center hover:border-[#155e42] transition-colors bg-[#fbfaf7]">
              <Upload className="w-8 h-8 text-[#155e42] mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="text-xs font-bold text-[#155e42] hover:underline">
                  Choose CSV File
                </span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-gray-400 mt-1">.csv format only</p>
            </div>

            {/* Pre-validation Preview */}
            {preview && (
              <div className="space-y-3 flex-1 overflow-y-auto">
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    ✓ {preview.valid.length} Valid Rows Ready
                  </span>
                  {preview.errors.length > 0 && (
                    <span className="text-red-700 bg-red-50 px-2.5 py-1 rounded-lg">
                      ✕ {preview.errors.length} Validation Errors
                    </span>
                  )}
                </div>

                {preview.errors.length > 0 && (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-[11px] text-red-700 space-y-1 max-h-32 overflow-y-auto">
                    <strong className="block">Validation Issues Detected:</strong>
                    {preview.errors.map((err, i) => (
                      <div key={i}>• {err}</div>
                    ))}
                  </div>
                )}

                {preview.valid.length > 0 && (
                  <div className="border border-[#e6e2d8] rounded-xl overflow-hidden max-h-40 overflow-y-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-[#fbfaf7] text-[#526359] text-[10px] uppercase font-bold border-b border-[#e6e2d8]">
                        <tr>
                          <th className="p-2">Name</th>
                          <th className="p-2">Class</th>
                          <th className="p-2">Roll</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f4f1eb]">
                        {preview.valid.slice(0, 10).map((r, i) => (
                          <tr key={i}>
                            <td className="p-2 font-semibold text-[#0a241b]">{r.name}</td>
                            <td className="p-2 text-[#155e42]">{r.classId}</td>
                            <td className="p-2 text-gray-500">{r.rollNo || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {preview.valid.length > 10 && (
                      <div className="p-2 text-[10px] text-gray-400 text-center bg-[#fbfaf7]">
                        ... and {preview.valid.length - 10} more valid students
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-[#e6e2d8]">
              <button
                type="button"
                onClick={() => {
                  setCsvModalOpen(false);
                  setPreview(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={importing || !preview || preview.valid.length === 0}
                onClick={confirmImport}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#155e42] text-white hover:bg-[#0a241b] transition-colors disabled:opacity-50"
              >
                {importing ? 'Importing Batch...' : `Confirm & Import ${preview?.valid.length || 0} Students`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
