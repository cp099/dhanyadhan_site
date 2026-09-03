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
  User,
  ArrowRight,
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

  // Form Fields - All on One Page
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [contributionType, setContributionType] = useState<ContributionType>('grain');
  const [moneyAmount, setMoneyAmount] = useState<string>('');
  const [grainQuantityKg, setGrainQuantityKg] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Fetch student roster and active campaign configuration
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Get user session to identify assigned class
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        if (!sessionRes.ok || !sessionData.user) {
          router.push('/login');
          return;
        }

        const classId = sessionData.user.classId || '2-bcom-afa';
        setUserClassId(classId);

        // Fetch students of this class
        const studentsRes = await fetch(`/api/students?classId=${classId}`);
        const studentsData = await studentsRes.json();
        if (studentsRes.ok) {
          setStudents(studentsData.students || []);
        }

        // Fetch campaign config
        const campRes = await fetch('/api/campaign');
        const campData = await campRes.json();
        if (campRes.ok && campData.config) {
          setCampaign(campData.config);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize form.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  // Selected student object
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Filter students in dropdown
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.rollNo && s.rollNo.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  // Live estimated calculation preview
  let calculatedPreview = 0;
  let calculationError: string | null = null;

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
    } catch (e: any) {
      calculationError = e.message;
    }
  }

  // Handle final submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedStudentId) {
      setError('Please select a student from the class roster.');
      return;
    }

    const numMoney = moneyAmount ? parseFloat(moneyAmount) : 0;
    const numGrain = grainQuantityKg ? parseFloat(grainQuantityKg) : 0;

    if (contributionType === 'money' && numMoney <= 0) {
      setError('Please enter a valid money amount (₹).');
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
        `Successfully recorded contribution for ${selectedStudent?.name}! (+${formatKg(
          data.contribution.equivalentKg
        )} added to class impact)`
      );

      // Reset contribution inputs while keeping the student or letting CR pick next
      setMoneyAmount('');
      setGrainQuantityKg('');
      setNotes('');

      // Refresh student list to reflect updated totals
      const refreshed = await fetch(`/api/students?classId=${userClassId}`);
      const refreshedData = await refreshed.json();
      if (refreshed.ok) setStudents(refreshedData.students || []);
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
        <span className="text-xs font-semibold">Loading class roster and conversion rules...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs">
        <div>
          <h2 className="text-2xl font-black text-[#0a241b] flex items-center gap-2.5">
            <PlusCircle className="w-6 h-6 text-[#155e42]" />
            Record Student Contribution
          </h2>
          <p className="text-xs text-[#526359] mt-1">
            Single-screen contribution logging for your class cohort. Select a student and enter physical food grain or monetary donation.
          </p>
        </div>

        <Link
          href="/cr/contributions"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#e6e2d8] hover:bg-[#fbfaf7] text-xs font-bold text-[#155e42] transition-colors self-start sm:self-auto shadow-2xs"
        >
          <History className="w-4 h-4" />
          <span>View Contribution History</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start justify-between gap-2.5 text-xs text-emerald-900">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
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

      {/* Unified Single-Page 2-Column Wide Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Student Selector from Preloaded Roster (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#f0ede6]">
            <div>
              <h3 className="text-base font-bold text-[#0a241b] flex items-center gap-2">
                <User className="w-4 h-4 text-[#155e42]" />
                1. Select Contributing Student
              </h3>
              <span className="text-xs text-[#526359]">
                {students.length} official students in this class roster
              </span>
            </div>
            {selectedStudent && (
              <button
                type="button"
                onClick={() => setSelectedStudentId('')}
                className="text-[11px] text-[#155e42] hover:underline font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] focus:bg-white focus:ring-2 focus:ring-[#155e42] focus:outline-none transition-all"
            />
          </div>

          {/* Student Roster Scrollable Cards */}
          <div className="max-h-[520px] overflow-y-auto space-y-2 pr-1">
            {filteredStudents.map((s) => {
              const isSelected = s.id === selectedStudentId;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedStudentId(s.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-[#155e42] bg-[#155e42]/5 shadow-xs ring-1 ring-[#155e42]'
                      : 'border-[#e6e2d8] bg-white hover:bg-[#fbfaf7] hover:border-gray-300'
                  }`}
                >
                  <div className="min-w-0">
                    <strong
                      className={`text-sm block truncate ${
                        isSelected ? 'text-[#155e42] font-black' : 'text-[#0a241b] font-bold'
                      }`}
                    >
                      {s.name}
                    </strong>
                    <span className="text-[11px] text-[#526359] block">
                      Roll: {s.rollNo || 'N/A'} • Past: {s.contributionCount || 0} ({formatKg(s.totalEquivalentKg || 0)})
                    </span>
                  </div>

                  <div className="flex-shrink-0">
                    {isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-[#155e42] text-white flex items-center justify-center text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs text-gray-400 group-hover:border-[#155e42]">
                        ○
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredStudents.length === 0 && (
              <div className="p-8 text-center text-xs text-gray-400">
                No students match &ldquo;{studentSearch}&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Contribution Inputs & Live Impact Preview (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#e6e2d8] shadow-xs space-y-6">
          {/* Active Selected Student Banner */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#526359] block mb-2">
              2. Contribution Details
            </span>

            {selectedStudent ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-emerald-800 font-semibold block">Contributing Student:</span>
                  <strong className="text-base text-emerald-950 block">{selectedStudent.name}</strong>
                  <span className="text-xs text-emerald-800 block">
                    Roll No: {selectedStudent.rollNo || 'N/A'} • Class: {userClassId}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Current Total</span>
                  <strong className="text-sm font-black text-[#155e42]">
                    {formatKg(selectedStudent.totalEquivalentKg || 0)}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>Please select a student from the roster on the left to activate this entry form.</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mode Selector */}
            <div>
              <label className="block text-xs font-bold text-[#0a241b] uppercase tracking-wider mb-2">
                Contribution Mode
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setContributionType('grain')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    contributionType === 'grain'
                      ? 'border-[#155e42] bg-[#155e42]/10 font-bold text-[#155e42] ring-1 ring-[#155e42]'
                      : 'border-[#e6e2d8] text-[#526359] hover:bg-gray-50'
                  }`}
                >
                  <Wheat className="w-5 h-5 mx-auto mb-1 text-[#155e42]" />
                  <span className="text-xs">Physical Grain</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContributionType('money')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    contributionType === 'money'
                      ? 'border-[#155e42] bg-[#155e42]/10 font-bold text-[#155e42] ring-1 ring-[#155e42]'
                      : 'border-[#e6e2d8] text-[#526359] hover:bg-gray-50'
                  }`}
                >
                  <Coins className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                  <span className="text-xs">Monetary (₹)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContributionType('both')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    contributionType === 'both'
                      ? 'border-[#155e42] bg-[#155e42]/10 font-bold text-[#155e42] ring-1 ring-[#155e42]'
                      : 'border-[#e6e2d8] text-[#526359] hover:bg-gray-50'
                  }`}
                >
                  <Layers className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                  <span className="text-xs">Both Combined</span>
                </button>
              </div>
            </div>

            {/* Grain Inputs */}
            {(contributionType === 'grain' || contributionType === 'both') && (
              <div className="p-4 bg-[#fbfaf7] rounded-2xl border border-[#e6e2d8] space-y-2">
                <label className="block text-xs font-bold text-[#0a241b] uppercase tracking-wider flex items-center gap-1.5">
                  <Wheat className="w-4 h-4 text-[#155e42]" />
                  Food Grain Quantity
                </label>
                <div className="relative flex rounded-xl border border-[#e6e2d8] bg-white focus-within:ring-2 focus-within:ring-[#155e42]">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="e.g. 5 or 10.5"
                    value={grainQuantityKg}
                    onChange={(e) => setGrainQuantityKg(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-bold bg-transparent text-[#0a241b] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="inline-flex items-center px-3 text-xs font-bold text-[#526359] border-l border-[#e6e2d8] bg-gray-50 rounded-r-xl">
                    KG
                  </span>
                </div>
                <span className="text-[11px] text-[#526359] block">
                  1 KG of contributed food grains = 1 Equivalent Impact KG.
                </span>
              </div>
            )}

            {/* Money Inputs */}
            {(contributionType === 'money' || contributionType === 'both') && (
              <div className="p-4 bg-[#fbfaf7] rounded-2xl border border-[#e6e2d8] space-y-2">
                <label className="block text-xs font-bold text-[#0a241b] uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  Monetary Support (₹)
                </label>
                <div className="relative flex rounded-xl border border-[#e6e2d8] bg-white focus-within:ring-2 focus-within:ring-[#155e42]">
                  <span className="inline-flex items-center px-3 text-sm font-bold text-[#526359] border-r border-[#e6e2d8] bg-gray-50 rounded-l-xl">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    placeholder="e.g. 250 or 500"
                    value={moneyAmount}
                    onChange={(e) => setMoneyAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-bold bg-transparent text-[#0a241b] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="inline-flex items-center px-3 text-xs font-bold text-[#526359] border-l border-[#e6e2d8] bg-gray-50 rounded-r-xl">
                    INR
                  </span>
                </div>
                <span className="text-[11px] text-[#526359] block">
                  Official Rate: ₹{campaign?.moneyToKgRate || 25} = 1 Equivalent KG.
                </span>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-[#0a241b] uppercase tracking-wider mb-1.5">
                Optional Notes / Reference
              </label>
              <input
                type="text"
                placeholder="e.g. Verified rice bag receipt or batch contribution"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] focus:bg-white focus:ring-2 focus:ring-[#155e42] focus:outline-none"
              />
            </div>

            {/* Live Equivalent Impact Summary Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0a241b] to-[#155e42] text-white space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#86efac]" />
                  Calculated Impact Score
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#86efac]">
                  +{formatKg(calculatedPreview)}
                </span>
              </div>

              <div className="text-xs text-gray-300 border-t border-white/10 pt-2 flex flex-wrap items-center justify-between gap-2">
                <span>
                  {contributionType === 'grain' && `${grainQuantityKg || 0} KG Food Grain`}
                  {contributionType === 'money' && `${formatCurrency(parseFloat(moneyAmount) || 0)} Monetary Support`}
                  {contributionType === 'both' &&
                    `${grainQuantityKg || 0} KG Grain + ${formatCurrency(parseFloat(moneyAmount) || 0)}`}
                </span>
                <span className="text-[11px] text-[#86efac] font-medium">
                  Directly adds to class & departmental total
                </span>
              </div>
            </div>

            {/* Direct Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting || !selectedStudentId}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#155e42] text-white font-bold text-sm hover:bg-[#0a241b] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusCircle className="w-5 h-5 text-[#86efac]" />
                <span>{submitting ? 'Recording Contribution...' : 'Record Contribution Now'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
