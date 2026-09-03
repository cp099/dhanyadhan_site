'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StudentDoc, CampaignConfig, ContributionType } from '@/lib/types';
import { calculateEquivalentKg } from '@/lib/calculations';
import { formatKg, formatCurrency } from '@/lib/utils';
import {
  PlusCircle,
  Coins,
  Wheat,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  Info,
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
  const [step, setStep] = useState<number>(1);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [contributionType, setContributionType] = useState<ContributionType>('grain');
  const [moneyAmount, setMoneyAmount] = useState<string>('');
  const [grainType, setGrainType] = useState<string>('');
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
          if (campData.config.acceptedGrains?.length > 0) {
            setGrainType(campData.config.acceptedGrains[0].name);
          }
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
          grainType,
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
  async function handleSubmit() {
    if (!selectedStudentId) {
      setError('Please select a student from the class roster.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        studentId: selectedStudentId,
        classId: userClassId,
        type: contributionType,
        moneyAmount: moneyAmount ? parseFloat(moneyAmount) : 0,
        grainType: contributionType !== 'money' ? grainType : null,
        grainQuantityKg:
          contributionType !== 'money' && grainQuantityKg ? parseFloat(grainQuantityKg) : 0,
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

      // Reset form fields
      setSelectedStudentId('');
      setMoneyAmount('');
      setGrainQuantityKg('');
      setNotes('');
      setStep(1);

      // Refresh student list
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
      <div className="p-12 text-center text-[#526359]">
        Loading class roster and conversion rules...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs">
        <h2 className="text-2xl font-black text-[#0a241b] flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-[#155e42]" />
          Record Student Contribution
        </h2>
        <p className="text-xs text-[#526359] mt-1">
          Select a student from your class roster and enter physical grain or monetary donation.
        </p>

        {/* Multi-step indicator */}
        <div className="mt-6 flex items-center justify-between text-xs font-bold">
          <div
            className={`flex items-center gap-1.5 ${
              step >= 1 ? 'text-[#155e42]' : 'text-gray-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step >= 1 ? 'bg-[#155e42] text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              1
            </span>
            <span>Select Student</span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-[#e6e2d8]"></div>
          <div
            className={`flex items-center gap-1.5 ${
              step >= 2 ? 'text-[#155e42]' : 'text-gray-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step >= 2 ? 'bg-[#155e42] text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              2
            </span>
            <span>Enter Contribution</span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-[#e6e2d8]"></div>
          <div
            className={`flex items-center gap-1.5 ${
              step >= 3 ? 'text-[#155e42]' : 'text-gray-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step >= 3 ? 'bg-[#155e42] text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              3
            </span>
            <span>Review & Submit</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-xs text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-2 text-xs text-emerald-900">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* STEP 1: SELECT STUDENT FROM PRELOADED ROSTER */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e6e2d8] shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#0a241b] mb-1">Step 1: Choose Contributing Student</h3>
            <p className="text-xs text-[#526359]">
              Contributions must belong to an official student in this class. No anonymous entries allowed.
            </p>
          </div>

          {/* Student Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#e6e2d8] text-sm focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7]"
            />
          </div>

          {/* Student Roster List */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((s) => {
                const isSelected = s.id === selectedStudentId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStudentId(s.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#155e42] bg-[#155e42]/5 shadow-xs'
                        : 'border-[#e6e2d8] hover:border-gray-300 bg-[#fbfaf7]'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-sm text-[#0a241b] block">{s.name}</span>
                      <span className="text-xs text-[#526359]">
                        {s.rollNo ? `Roll: ${s.rollNo} • ` : ''}Past Contributions: {s.contributionCount} ({formatKg(s.totalEquivalentKg)})
                      </span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-[#155e42]" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-[#526359]">
                No students found matching "{studentSearch}".
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#e6e2d8] flex justify-end">
            <button
              type="button"
              disabled={!selectedStudentId}
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#155e42] text-white font-bold text-sm hover:bg-[#0a241b] transition-colors disabled:opacity-40"
            >
              Next: Contribution Details
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CONTRIBUTION DETAILS (MONEY / GRAIN / BOTH) */}
      {step === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e6e2d8] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#e6e2d8]">
            <div>
              <span className="text-xs text-[#526359] block">Contributing Student:</span>
              <strong className="text-base text-[#0a241b]">{selectedStudent?.name}</strong>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-[#155e42] hover:underline font-semibold"
            >
              Change Student
            </button>
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#526359] uppercase tracking-wider mb-2">
              Contribution Mode
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setContributionType('grain')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  contributionType === 'grain'
                    ? 'border-[#155e42] bg-[#155e42]/10 font-bold text-[#155e42]'
                    : 'border-[#e6e2d8] text-[#526359] hover:bg-gray-50'
                }`}
              >
                <Wheat className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Physical Grain</span>
              </button>

              <button
                type="button"
                onClick={() => setContributionType('money')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  contributionType === 'money'
                    ? 'border-[#155e42] bg-[#155e42]/10 font-bold text-[#155e42]'
                    : 'border-[#e6e2d8] text-[#526359] hover:bg-gray-50'
                }`}
              >
                <Coins className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Monetary (₹)</span>
              </button>

              <button
                type="button"
                onClick={() => setContributionType('both')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  contributionType === 'both'
                    ? 'border-[#155e42] bg-[#155e42]/10 font-bold text-[#155e42]'
                    : 'border-[#e6e2d8] text-[#526359] hover:bg-gray-50'
                }`}
              >
                <Layers className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Both Combined</span>
              </button>
            </div>
          </div>

          {/* Grain Inputs */}
          {(contributionType === 'grain' || contributionType === 'both') && (
            <div className="p-4 bg-[#fbfaf7] rounded-2xl border border-[#e6e2d8] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#155e42] flex items-center gap-1.5">
                <Wheat className="w-4 h-4" /> Food Grain Quantity
              </h4>
              <div>
                <label className="block text-xs font-semibold text-[#526359] mb-1">
                  Food Grain Contributed (in Kilograms)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="e.g. 5 or 10.5"
                    value={grainQuantityKg}
                    onChange={(e) => setGrainQuantityKg(e.target.value)}
                    className="w-full pl-3 pr-12 py-2.5 rounded-xl border border-[#e6e2d8] text-sm bg-white focus:ring-2 focus:ring-[#155e42] focus:outline-none"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                    KG
                  </span>
                </div>
                <span className="text-[11px] text-[#526359] mt-1 block">
                  1 KG of contributed food grains = 1 Equivalent Impact KG.
                </span>
              </div>
            </div>
          )}

          {/* Money Inputs */}
          {(contributionType === 'money' || contributionType === 'both') && (
            <div className="p-4 bg-[#fbfaf7] rounded-2xl border border-[#e6e2d8] space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#155e42] flex items-center gap-1.5">
                <Coins className="w-4 h-4" /> Monetary Support Details
              </h4>
              <div>
                <label className="block text-xs font-semibold text-[#526359] mb-1">
                  Amount in Rupees (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    placeholder="e.g. 250, 500, 1000"
                    value={moneyAmount}
                    onChange={(e) => setMoneyAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#e6e2d8] text-sm bg-white focus:ring-2 focus:ring-[#155e42] focus:outline-none"
                  />
                </div>
                <span className="text-[11px] text-[#526359] mt-1 block">
                  Official Rate:{' '}
                  {campaign?.moneyToKgRate
                    ? `₹${campaign.moneyToKgRate} = 1 Equivalent KG`
                    : 'Pending SDG Cell configuration'}
                </span>
              </div>
            </div>
          )}

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#526359] uppercase tracking-wider mb-1">
              Internal Class Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Received during morning assembly"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#e6e2d8] text-sm focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7]"
            />
          </div>

          {/* Live Calculated Impact Preview */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
                  Official Impact Preview
                </span>
                <span className="text-[11px] text-emerald-800">
                  Calculated automatically via SDG Cell campaign rules
                </span>
              </div>
            </div>
            <div className="text-right">
              {calculationError ? (
                <span className="text-xs text-amber-700 font-semibold">{calculationError}</span>
              ) : (
                <span className="text-2xl font-black text-emerald-900">
                  +{formatKg(calculatedPreview)}
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="pt-4 border-t border-[#e6e2d8] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#526359] hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="button"
              disabled={
                calculatedPreview <= 0 ||
                (contributionType === 'money' && !moneyAmount) ||
                (contributionType === 'grain' && !grainQuantityKg)
              }
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#155e42] text-white font-bold text-sm hover:bg-[#0a241b] transition-colors disabled:opacity-40 shadow-sm"
            >
              Review Summary
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW & SUBMIT */}
      {step === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e6e2d8] shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#0a241b] mb-1">Step 3: Review & Commit Record</h3>
            <p className="text-xs text-[#526359]">
              Please verify the details below. Once submitted, the official class and department aggregates will atomically update.
            </p>
          </div>

          <div className="bg-[#fbfaf7] p-6 rounded-2xl border border-[#e6e2d8] space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#e6e2d8]">
              <span className="text-xs text-[#526359] uppercase font-semibold">Student</span>
              <span className="text-sm font-bold text-[#0a241b]">{selectedStudent?.name}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-[#e6e2d8]">
              <span className="text-xs text-[#526359] uppercase font-semibold">Type</span>
              <span className="text-sm font-semibold capitalize text-[#0a241b]">
                {contributionType}
              </span>
            </div>

            {moneyAmount && parseFloat(moneyAmount) > 0 && (
              <div className="flex justify-between items-center pb-3 border-b border-[#e6e2d8]">
                <span className="text-xs text-[#526359] uppercase font-semibold">Money Amount</span>
                <span className="text-sm font-bold text-emerald-700">
                  {formatCurrency(parseFloat(moneyAmount))}
                </span>
              </div>
            )}

            {grainQuantityKg && parseFloat(grainQuantityKg) > 0 && (
              <div className="flex justify-between items-center pb-3 border-b border-[#e6e2d8]">
                <span className="text-xs text-[#526359] uppercase font-semibold">Food Grain</span>
                <span className="text-sm font-bold text-amber-900">
                  {grainQuantityKg} KG ({grainType})
                </span>
              </div>
            )}

            {notes && (
              <div className="flex justify-between items-center pb-3 border-b border-[#e6e2d8]">
                <span className="text-xs text-[#526359] uppercase font-semibold">Notes</span>
                <span className="text-xs text-[#526359]">{notes}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-extrabold text-[#155e42]">Total Impact Added</span>
              <span className="text-3xl font-black text-[#155e42]">
                +{formatKg(calculatedPreview)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#e6e2d8]">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#526359] hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Edit Values
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#22c55e] text-[#0a241b] font-black text-sm hover:bg-[#4ade80] transition-all shadow-md hover:scale-105 disabled:opacity-50"
            >
              {submitting ? 'Committing Contribution...' : 'Confirm & Record Contribution'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
