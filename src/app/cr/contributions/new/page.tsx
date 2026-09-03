'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StudentDoc, CampaignConfig, ContributionType } from '@/lib/types';
import { calculateEquivalentKg } from '@/lib/calculations';
import { formatKg, formatCurrency } from '@/lib/utils';
import {
  PlusCircle,
  Coins,
  Wheat,
  Layers,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  History,
  Users,
  UserCheck,
} from 'lucide-react';

export default function NewContributionPage() {
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [students, setStudents] = useState<StudentDoc[]>([]);
  const [campaign, setCampaign] = useState<CampaignConfig | null>(null);
  const [userClassId, setUserClassId] = useState<string>('');

  // Form Fields
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [contributionType, setContributionType] = useState<ContributionType>('grain');
  const [moneyAmount, setMoneyAmount] = useState<string>('');
  const [grainQuantityKg, setGrainQuantityKg] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Fetch student roster and campaign config
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        if (!sessionRes.ok || !sessionData.user) {
          router.push('/login');
          return;
        }

        const classId = sessionData.user.classId || '2-bcom-afa';
        setUserClassId(classId);

        const [studentsRes, campRes] = await Promise.all([
          fetch(`/api/students?classId=${classId}`),
          fetch('/api/campaign'),
        ]);

        const sData = await studentsRes.json();
        const campData = await campRes.json();

        if (sData.students) setStudents(sData.students);
        if (campData.config) setCampaign(campData.config);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize form.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.rollNo && s.rollNo.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  // Live estimated calculation preview
  let calculatedPreview = 0;
  if (campaign) {
    try {
      const result = calculateEquivalentKg(
        {
          type: contributionType,
          moneyAmount: moneyAmount ? parseFloat(moneyAmount) : 0,
          grainType: 'Food Grains',
          grainQuantityKg: grainQuantityKg ? parseFloat(grainQuantityKg) : 0,
        },
        campaign
      );
      calculatedPreview = result.equivalentKg;
    } catch {
      calculatedPreview = 0;
    }
  }

  // Handle direct submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedStudentId) {
      setError('Please select a student from the class roster.');
      return;
    }

    const numMoney = moneyAmount ? parseFloat(moneyAmount) : 0;
    const numGrain = grainQuantityKg ? parseFloat(grainQuantityKg) : 0;

    if (contributionType === 'money' && numMoney <= 0) {
      setError('Please enter a valid monetary amount (₹).');
      return;
    }
    if (contributionType === 'grain' && numGrain <= 0) {
      setError('Please enter a valid grain quantity in KG.');
      return;
    }
    if (contributionType === 'both' && numMoney <= 0 && numGrain <= 0) {
      setError('Please enter grain quantity, money amount, or both.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        studentId: selectedStudentId,
        classId: userClassId,
        type: contributionType,
        moneyAmount: numMoney,
        grainType: contributionType !== 'money' ? 'Food Grains' : null,
        grainQuantityKg: contributionType !== 'money' ? numGrain : 0,
        notes: notes.trim() || undefined,
      };

      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record contribution.');
      }

      setSuccessMsg(
        `Recorded contribution for ${selectedStudent?.name}! (+${formatKg(
          data.contribution.equivalentKg
        )} added)`
      );

      // Reset entry values
      setMoneyAmount('');
      setGrainQuantityKg('');
      setNotes('');

      // Refresh student roster
      const refreshedStudents = await fetch(`/api/students?classId=${userClassId}`);
      const sData = await refreshedStudents.json();
      if (sData.students) setStudents(sData.students);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-16 text-center text-[#526359]">
        <div className="w-8 h-8 border-2 border-[#155e42] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs font-semibold">Loading contribution workspace...</span>
      </div>
    );
  }

  const totalClassKg = students.reduce((acc, s) => acc + (s.totalEquivalentKg || 0), 0);
  const activeContributors = students.filter((s) => (s.contributionCount || 0) > 0).length;

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0a241b] tracking-tight">
              Contribution Console
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#155e42] font-bold border border-emerald-200">
              {userClassId}
            </span>
          </div>
          <p className="text-xs text-[#526359] mt-0.5">
            Select any student from your class roster to log physical food grains or monetary support.
          </p>
        </div>

        {/* Telemetry Pills */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="bg-white px-3.5 py-2 rounded-xl border border-[#e6e2d8] shadow-2xs text-center">
            <span className="text-[10px] font-bold uppercase text-[#526359] block">Class Impact</span>
            <strong className="text-xs font-black text-[#155e42] block">{formatKg(totalClassKg)}</strong>
          </div>
          <div className="bg-white px-3.5 py-2 rounded-xl border border-[#e6e2d8] shadow-2xs text-center">
            <span className="text-[10px] font-bold uppercase text-[#526359] block">Participation</span>
            <strong className="text-xs font-black text-[#0a241b] block">
              {activeContributors} / {students.length}
            </strong>
          </div>
          <Link
            href="/cr/contributions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#e6e2d8] bg-white hover:bg-[#fbfaf7] text-xs font-bold text-[#155e42] shadow-2xs transition-colors"
          >
            <History className="w-3.5 h-3.5 text-[#155e42]" />
            <span>History</span>
          </Link>
        </div>
      </div>

      {/* Alert Notifications */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2.5 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Balanced 2-Column Wide Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN (7 Cols): Interactive Class Roster Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#e6e2d8] p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0ede6]">
            <div>
              <h2 className="text-base font-bold text-[#0a241b] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#155e42]" />
                Class Student Roster
              </h2>
              <p className="text-xs text-[#526359]">
                Click any student to load them into the contribution form.
              </p>
            </div>

            {/* Instant Search Filter */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name or roll..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] focus:bg-white focus:ring-2 focus:ring-[#155e42] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Roster Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e6e2d8] text-[#526359] uppercase tracking-wider bg-[#fbfaf7]">
                  <th className="py-2.5 px-3">Roll No</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3 text-center">Entries</th>
                  <th className="py-2.5 px-3 text-right">Total Impact</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f1eb]">
                {filteredStudents.map((s) => {
                  const isSelected = s.id === selectedStudentId;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedStudentId(s.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-50/80 font-semibold'
                          : 'hover:bg-[#fbfaf7]'
                      }`}
                    >
                      <td className="py-3 px-3 text-gray-500 font-mono text-[11px]">
                        {s.rollNo || '—'}
                      </td>
                      <td className="py-3 px-3 text-[#0a241b] font-bold">
                        {s.name}
                        {isSelected && (
                          <span className="ml-2 text-[10px] text-[#155e42] font-black uppercase tracking-wider">
                            (Selected)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center text-gray-600">
                        {s.contributionCount || 0}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-[#155e42]">
                        {formatKg(s.totalEquivalentKg || 0)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentId(s.id);
                          }}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            isSelected
                              ? 'bg-[#155e42] text-white shadow-2xs'
                              : 'bg-gray-100 hover:bg-[#155e42] hover:text-white text-gray-700'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Select'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div className="py-8 text-center text-xs text-gray-400">
                No students match &ldquo;{studentSearch}&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (5 Cols): Compact Entry Card (Sticky on desktop) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-32">
          <div className="bg-white rounded-2xl border border-[#e6e2d8] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ede6]">
              <h2 className="text-base font-bold text-[#0a241b] flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#155e42]" />
                Record Contribution
              </h2>
              {selectedStudent && (
                <button
                  type="button"
                  onClick={() => setSelectedStudentId('')}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {/* Active Student Badge / Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#0a241b] uppercase tracking-wider">
                Contributing Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] text-[#0a241b] focus:bg-white focus:ring-2 focus:ring-[#155e42] focus:outline-none transition-all"
              >
                <option value="">-- Choose student from list --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.rollNo ? `(${s.rollNo})` : ''}
                  </option>
                ))}
              </select>
              {selectedStudent ? (
                <div className="flex items-center justify-between text-[11px] text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 mt-1">
                  <span>Selected: <strong>{selectedStudent.name}</strong></span>
                  <span>Impact: <strong>{formatKg(selectedStudent.totalEquivalentKg || 0)}</strong></span>
                </div>
              ) : (
                <span className="text-[11px] text-gray-400 block mt-1">
                  Select above or click any row in the roster.
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Contribution Mode Toggle */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#0a241b] uppercase tracking-wider">
                  Contribution Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setContributionType('grain')}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 ${
                      contributionType === 'grain'
                        ? 'border-[#155e42] bg-[#155e42]/10 font-bold text-[#155e42] ring-1 ring-[#155e42]'
                        : 'border-[#e6e2d8] text-[#526359] hover:bg-gray-50'
                    }`}
                  >
                    <Wheat className="w-3.5 h-3.5 text-[#155e42]" />
                    <span className="text-xs">Grain</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContributionType('money')}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 ${
                      contributionType === 'money'
                        ? 'border-[#155e42] bg-[#155e42]/10 font-bold text-[#155e42] ring-1 ring-[#155e42]'
                        : 'border-[#e6e2d8] text-[#526359] hover:bg-gray-50'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs">Money (₹)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContributionType('both')}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 ${
                      contributionType === 'both'
                        ? 'border-[#155e42] bg-[#155e42]/10 font-bold text-[#155e42] ring-1 ring-[#155e42]'
                        : 'border-[#e6e2d8] text-[#526359] hover:bg-gray-50'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-xs">Both</span>
                  </button>
                </div>
              </div>

              {/* Grain Input */}
              {(contributionType === 'grain' || contributionType === 'both') && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#0a241b] uppercase tracking-wider flex items-center gap-1.5">
                    <Wheat className="w-3.5 h-3.5 text-[#155e42]" />
                    Food Grain Quantity
                  </label>
                  <div className="relative flex rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#155e42]">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="e.g. 5 or 10.5"
                      value={grainQuantityKg}
                      onChange={(e) => setGrainQuantityKg(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold bg-transparent text-[#0a241b] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="inline-flex items-center px-3 text-xs font-bold text-[#526359] border-l border-[#e6e2d8] bg-white rounded-r-xl">
                      KG
                    </span>
                  </div>
                  <span className="text-[10px] text-[#526359]">1 KG = 1 Equivalent KG</span>
                </div>
              )}

              {/* Money Input */}
              {(contributionType === 'money' || contributionType === 'both') && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#0a241b] uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-emerald-600" />
                    Monetary Support (₹)
                  </label>
                  <div className="relative flex rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#155e42]">
                    <span className="inline-flex items-center px-3 text-xs font-bold text-[#526359] border-r border-[#e6e2d8] bg-white rounded-l-xl">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      placeholder="e.g. 250 or 500"
                      value={moneyAmount}
                      onChange={(e) => setMoneyAmount(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold bg-transparent text-[#0a241b] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="inline-flex items-center px-3 text-xs font-bold text-[#526359] border-l border-[#e6e2d8] bg-white rounded-r-xl">
                      INR
                    </span>
                  </div>
                  <span className="text-[10px] text-[#526359]">
                    ₹{campaign?.moneyToKgRate || 25} = 1 Equivalent KG
                  </span>
                </div>
              )}

              {/* Notes (Optional) */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#0a241b] uppercase tracking-wider">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified bag or batch reference"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] focus:bg-white focus:ring-2 focus:ring-[#155e42] focus:outline-none"
                />
              </div>

              {/* Live Impact Preview Card */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#0a241b] to-[#155e42] text-white flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#86efac]" />
                  <span className="text-xs font-bold text-gray-200">Impact Score:</span>
                </div>
                <span className="text-base font-black text-[#86efac]">
                  +{formatKg(calculatedPreview)}
                </span>
              </div>

              {/* Direct Submit Button */}
              <button
                type="submit"
                disabled={submitting || !selectedStudentId}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#155e42] hover:bg-[#0a241b] text-white font-bold text-xs transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <PlusCircle className="w-4 h-4 text-[#86efac]" />
                <span>{submitting ? 'Recording...' : 'Record Contribution Now'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
