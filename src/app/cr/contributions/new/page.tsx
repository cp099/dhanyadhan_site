'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StudentDoc, CampaignConfig, ContributionType, ContributionDoc } from '@/lib/types';
import { calculateEquivalentKg } from '@/lib/calculations';
import { formatKg, formatCurrency, formatDate } from '@/lib/utils';
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
  Users,
  Clock,
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
  const [recentContributions, setRecentContributions] = useState<ContributionDoc[]>([]);
  const [campaign, setCampaign] = useState<CampaignConfig | null>(null);
  const [userClassId, setUserClassId] = useState<string>('');

  // Form Fields - All in One Dashboard
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [contributionType, setContributionType] = useState<ContributionType>('grain');
  const [moneyAmount, setMoneyAmount] = useState<string>('');
  const [grainQuantityKg, setGrainQuantityKg] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Fetch student roster, campaign config, and recent contributions
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

        // Fetch recent contributions
        const contribRes = await fetch(`/api/contributions?classId=${classId}`);
        const contribData = await contribRes.json();
        if (contribRes.ok) {
          setRecentContributions(contribData.contributions || []);
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

  // Filter students for the quick search
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

  // Handle direct submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedStudentId) {
      setError('Please select a student from your class roster.');
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
        `Recorded contribution for ${selectedStudent?.name}! (+${formatKg(
          data.contribution.equivalentKg
        )} added to class total)`
      );

      // Reset entry values
      setMoneyAmount('');
      setGrainQuantityKg('');
      setNotes('');

      // Refresh data
      const [refreshedStudents, refreshedContribs] = await Promise.all([
        fetch(`/api/students?classId=${userClassId}`),
        fetch(`/api/contributions?classId=${userClassId}`),
      ]);

      const sData = await refreshedStudents.json();
      const cData = await refreshedContribs.json();

      if (sData.students) setStudents(sData.students);
      if (cData.contributions) setRecentContributions(cData.contributions);
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
        <span className="text-xs font-semibold">Loading contribution dashboard...</span>
      </div>
    );
  }

  // Calculate quick class stats
  const totalClassKg = students.reduce((acc, s) => acc + (s.totalEquivalentKg || 0), 0);
  const activeContributors = students.filter((s) => (s.contributionCount || 0) > 0).length;

  return (
    <div className="w-full space-y-8">
      {/* Top Header & Context Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#e6e2d8] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0a241b] tracking-tight">
              Contribution Dashboard
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#155e42] font-bold border border-emerald-200">
              {userClassId}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#526359] mt-1">
            Fast single-screen contribution logging. Select any student below to record physical food grain or monetary donations.
          </p>
        </div>

        {/* Quick Class Summary Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#fbfaf7] px-4 py-2 rounded-2xl border border-[#e6e2d8] text-center">
            <span className="text-[10px] font-bold uppercase text-[#526359] block">Class Impact</span>
            <strong className="text-sm font-black text-[#155e42] block">{formatKg(totalClassKg)}</strong>
          </div>

          <div className="bg-[#fbfaf7] px-4 py-2 rounded-2xl border border-[#e6e2d8] text-center">
            <span className="text-[10px] font-bold uppercase text-[#526359] block">Contributors</span>
            <strong className="text-sm font-black text-[#0a241b] block">
              {activeContributors} / {students.length}
            </strong>
          </div>

          <Link
            href="/cr/contributions"
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[#155e42] hover:bg-[#0a241b] text-white text-xs font-bold transition-all shadow-xs"
          >
            <History className="w-4 h-4 text-[#86efac]" />
            <span>Full History</span>
          </Link>
        </div>
      </div>

      {/* Notifications */}
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

      {/* MAIN UNIFIED CONTRIBUTION ENTRY CARD (NO STEPS) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6e2d8] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0ede6]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#155e42]/10 flex items-center justify-center text-[#155e42]">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0a241b]">Record Contribution</h2>
              <span className="text-xs text-[#526359]">
                Choose student, set mode & amounts, then click record.
              </span>
            </div>
          </div>

          {selectedStudent && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Selected: <strong>{selectedStudent.name}</strong> ({selectedStudent.rollNo || 'No Roll'})
              </span>
              <button
                type="button"
                onClick={() => setSelectedStudentId('')}
                className="text-xs text-emerald-700 hover:underline font-bold ml-1"
              >
                Change
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Student Picker & Mode */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Student Dropdown / Searchable Select (6 cols) */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="block text-xs font-bold text-[#0a241b] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#155e42]" />
                Student From Class Roster
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
                className="w-full px-3.5 py-3 text-sm font-semibold rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] text-[#0a241b] focus:bg-white focus:ring-2 focus:ring-[#155e42] focus:outline-none transition-all"
              >
                <option value="">-- Click to choose a student ({students.length} available) --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.rollNo ? `(${s.rollNo})` : ''} — Total: {formatKg(s.totalEquivalentKg || 0)}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-[#526359] block">
                You can also click any student in the roster list below to auto-select them.
              </span>
            </div>

            {/* Contribution Mode Toggle (6 cols) */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="block text-xs font-bold text-[#0a241b] uppercase tracking-wider">
                Contribution Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setContributionType('grain')}
                  className={`py-2.5 px-3 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 ${
                    contributionType === 'grain'
                      ? 'border-[#155e42] bg-[#155e42]/10 font-bold text-[#155e42] ring-1 ring-[#155e42]'
                      : 'border-[#e6e2d8] text-[#526359] hover:bg-gray-50'
                  }`}
                >
                  <Wheat className="w-4 h-4 text-[#155e42]" />
                  <span className="text-xs font-semibold">Grain</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContributionType('money')}
                  className={`py-2.5 px-3 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 ${
                    contributionType === 'money'
                      ? 'border-[#155e42] bg-[#155e42]/10 font-bold text-[#155e42] ring-1 ring-[#155e42]'
                      : 'border-[#e6e2d8] text-[#526359] hover:bg-gray-50'
                  }`}
                >
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold">Money (₹)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContributionType('both')}
                  className={`py-2.5 px-3 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 ${
                    contributionType === 'both'
                      ? 'border-[#155e42] bg-[#155e42]/10 font-bold text-[#155e42] ring-1 ring-[#155e42]'
                      : 'border-[#e6e2d8] text-[#526359] hover:bg-gray-50'
                  }`}
                >
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold">Both</span>
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Contribution Quantities */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Grain Input */}
            {(contributionType === 'grain' || contributionType === 'both') && (
              <div
                className={`space-y-1.5 ${
                  contributionType === 'both' ? 'md:col-span-6' : 'md:col-span-12'
                }`}
              >
                <label className="block text-xs font-bold text-[#0a241b] uppercase tracking-wider flex items-center gap-1.5">
                  <Wheat className="w-3.5 h-3.5 text-[#155e42]" />
                  Food Grain Contributed
                </label>
                <div className="relative flex rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#155e42]">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="e.g. 5 or 10.5"
                    value={grainQuantityKg}
                    onChange={(e) => setGrainQuantityKg(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-bold bg-transparent text-[#0a241b] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="inline-flex items-center px-3.5 text-xs font-bold text-[#526359] border-l border-[#e6e2d8] bg-white rounded-r-xl">
                    KG
                  </span>
                </div>
                <span className="text-[11px] text-[#526359] block">
                  1 KG Grain = 1 Equivalent Impact KG
                </span>
              </div>
            )}

            {/* Money Input */}
            {(contributionType === 'money' || contributionType === 'both') && (
              <div
                className={`space-y-1.5 ${
                  contributionType === 'both' ? 'md:col-span-6' : 'md:col-span-12'
                }`}
              >
                <label className="block text-xs font-bold text-[#0a241b] uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-600" />
                  Monetary Support (₹)
                </label>
                <div className="relative flex rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#155e42]">
                  <span className="inline-flex items-center px-3.5 text-sm font-bold text-[#526359] border-r border-[#e6e2d8] bg-white rounded-l-xl">
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
                  <span className="inline-flex items-center px-3 text-xs font-bold text-[#526359] border-l border-[#e6e2d8] bg-white rounded-r-xl">
                    INR
                  </span>
                </div>
                <span className="text-[11px] text-[#526359] block">
                  Rate: ₹{campaign?.moneyToKgRate || 25} = 1 Equivalent KG
                </span>
              </div>
            )}
          </div>

          {/* Row 3: Notes (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0a241b] uppercase tracking-wider">
              Notes / Reference (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Verified rice bag receipt or batch contribution"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] focus:bg-white focus:ring-2 focus:ring-[#155e42] focus:outline-none"
            />
          </div>

          {/* Row 4: Live Telemetry & Direct Action Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0a241b] to-[#155e42] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="w-4 h-4 text-[#86efac]" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-200">
                  Calculated Impact Score:
                </span>
                <span className="text-xl font-black text-[#86efac]">
                  +{formatKg(calculatedPreview)}
                </span>
              </div>
              <p className="text-xs text-gray-300">
                {selectedStudent
                  ? `Recording for ${selectedStudent.name}`
                  : 'Select a student above to record'}
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedStudentId}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#22c55e] text-[#0a241b] hover:bg-[#4ade80] font-black text-sm transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>{submitting ? 'Recording...' : 'Record Contribution Now'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* LOWER DASHBOARD SPLIT: Class Student Roster Fast-Selector & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Class Student Roster (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#e6e2d8] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0ede6]">
            <div>
              <h3 className="text-base font-bold text-[#0a241b] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#155e42]" />
                Class Student Roster
              </h3>
              <p className="text-xs text-[#526359]">
                Click &ldquo;Select&rdquo; to quickly load any student into the contribution box above.
              </p>
            </div>

            {/* Instant Search Filter */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by name or roll..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] focus:bg-white focus:ring-2 focus:ring-[#155e42] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e6e2d8] text-[#526359] uppercase tracking-wider bg-[#fbfaf7]">
                  <th className="py-2.5 px-3">Roll No</th>
                  <th className="py-2.5 px-3">Student Name</th>
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
                        isSelected ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-[#fbfaf7]'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px]">
                        {s.rollNo || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-[#0a241b] font-bold">
                        {s.name}
                        {isSelected && (
                          <span className="ml-2 text-[10px] text-[#155e42] font-black uppercase">
                            (Selected)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-[#155e42]">
                        {formatKg(s.totalEquivalentKg || 0)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentId(s.id);
                            window.scrollTo({ top: 120, behavior: 'smooth' });
                          }}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            isSelected
                              ? 'bg-[#155e42] text-white'
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
                No students found matching &ldquo;{studentSearch}&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Recent Contributions Live Feed (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#e6e2d8] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0ede6]">
            <div>
              <h3 className="text-base font-bold text-[#0a241b] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#155e42]" />
                Recent Class Submissions
              </h3>
              <p className="text-xs text-[#526359]">
                Live feed of entries recorded for your class.
              </p>
            </div>
            <Link
              href="/cr/contributions"
              className="text-xs font-semibold text-[#155e42] hover:underline"
            >
              All →
            </Link>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {recentContributions.slice(0, 8).map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl border border-[#e6e2d8] bg-[#fbfaf7] flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <strong className="text-[#0a241b] block truncate">{c.studentName}</strong>
                  <span className="text-[11px] text-gray-500 block">
                    {c.type === 'grain' && `${c.grainQuantityKg} KG Food Grains`}
                    {c.type === 'money' && formatCurrency(c.moneyAmount)}
                    {c.type === 'both' &&
                      `${c.grainQuantityKg} KG Grains + ${formatCurrency(c.moneyAmount)}`}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    {formatDate(c.createdAt)}
                  </span>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-black text-[#155e42] block">
                    +{formatKg(c.equivalentKg)}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Impact</span>
                </div>
              </div>
            ))}

            {recentContributions.length === 0 && (
              <div className="py-8 text-center text-xs text-gray-400">
                No contributions recorded yet for this class.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
