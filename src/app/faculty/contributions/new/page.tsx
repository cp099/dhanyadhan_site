'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FacultyDoc, CampaignConfig, ContributionType } from '@/lib/types';
import { formatKg, formatCurrency } from '@/lib/utils';
import { compressImageFile, formatBytes } from '@/lib/imageCompression';
import {
  PlusCircle,
  Coins,
  Wheat,
  Layers,
  CheckCircle2,
  AlertCircle,
  Search,
  History,
  Users,
  GraduationCap,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  RefreshCw,
  X,
  Briefcase,
} from 'lucide-react';

export default function NewFacultyContributionPage() {
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [facultyList, setFacultyList] = useState<FacultyDoc[]>([]);
  const [campaign, setCampaign] = useState<CampaignConfig | null>(null);

  // Form Fields
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [facultySearch, setFacultySearch] = useState<string>('');
  const [contributionType, setContributionType] = useState<ContributionType>('grain');
  const [moneyAmount, setMoneyAmount] = useState<string>('');
  const [grainQuantityKg, setGrainQuantityKg] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Payment Proof Screenshot States
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
  const [compressingImage, setCompressingImage] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    reduction: number;
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Fetch faculty roster and campaign config
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

        const [facultyRes, campRes] = await Promise.all([
          fetch('/api/faculty'),
          fetch('/api/campaign'),
        ]);

        const fData = await facultyRes.json();
        const campData = await campRes.json();

        if (fData.faculty) setFacultyList(fData.faculty);
        if (campData.config) setCampaign(campData.config);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize faculty contribution form.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const selectedFaculty = facultyList.find((f) => f.id === selectedFacultyId);

  const filteredFaculty = facultyList.filter(
    (f) =>
      f.active &&
      (f.name.toLowerCase().includes(facultySearch.toLowerCase()) ||
        f.designation.toLowerCase().includes(facultySearch.toLowerCase()) ||
        (f.department && f.department.toLowerCase().includes(facultySearch.toLowerCase())))
  );

  // File Upload Handlers
  async function processSelectedFile(file: File) {
    setImageError(null);
    setCompressingImage(true);
    try {
      const result = await compressImageFile(file);
      setPaymentProofUrl(result.dataUrl);
      setCompressionStats({
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        reduction: result.reductionPercentage,
      });
    } catch (err: any) {
      setImageError(err.message || 'Failed to process screenshot.');
      setPaymentProofUrl(null);
      setCompressionStats(null);
    } finally {
      setCompressingImage(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  }

  // Handle direct submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedFacultyId) {
      setError('Please select a faculty member from the roster.');
      return;
    }

    const numMoney = moneyAmount ? parseFloat(moneyAmount) : 0;
    const numGrain = grainQuantityKg ? parseFloat(grainQuantityKg) : 0;
    const isMonetary = contributionType === 'money' || contributionType === 'both';

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

    // Mandatory payment proof screenshot validation
    if (isMonetary && !paymentProofUrl) {
      setError('Payment verification screenshot (PNG, JPEG, HEIC, SVG) is mandatory for all monetary faculty contributions.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        facultyId: selectedFacultyId,
        type: contributionType,
        moneyAmount: numMoney,
        grainType: contributionType !== 'money' ? 'Food Grains' : null,
        grainQuantityKg: contributionType !== 'money' ? numGrain : 0,
        paymentProofUrl: isMonetary ? paymentProofUrl : null,
        notes: notes.trim() || undefined,
      };

      const res = await fetch('/api/faculty/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record faculty contribution.');
      }

      setSuccessMsg(
        `Recorded contribution for ${selectedFaculty?.name}! (+${formatKg(
          data.contribution.equivalentKg
        )} added)`
      );

      // Reset entry values
      setMoneyAmount('');
      setGrainQuantityKg('');
      setNotes('');
      setPaymentProofUrl(null);
      setCompressionStats(null);
      setImageError(null);

      // Refresh faculty roster
      const refreshedFaculty = await fetch('/api/faculty');
      const fData = await refreshedFaculty.json();
      if (fData.faculty) setFacultyList(fData.faculty);
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
        <span className="text-xs font-semibold">Loading faculty contribution workspace...</span>
      </div>
    );
  }

  const totalFacultyKg = facultyList
    .filter((f) => f.active)
    .reduce((acc, f) => acc + (f.totalEquivalentKg || 0), 0);

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0a241b] tracking-tight">
              Log Faculty Contribution
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#155e42] font-bold border border-emerald-200">
              Department of Commerce
            </span>
          </div>
          <p className="text-xs text-[#526359] mt-0.5">
            Select a faculty member from the departmental roster to record physical food grain donations or verified monetary support.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/faculty/contributions"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-[#0a241b] hover:bg-gray-50 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-[#526359]" />
            <span>Contribution Ledger</span>
          </Link>
          <Link
            href="/faculty/roster"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-[#0a241b] hover:bg-gray-50 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-[#526359]" />
            <span>Faculty Directory</span>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1 font-medium">{error}</div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
          <div className="flex-1 font-medium">{successMsg}</div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-8 min-w-0">
        {/* Left Column: Faculty Selector & Quick Stats */}
        <div className="w-full lg:w-5/12 space-y-4">
          {/* Quick Roster Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-[#e2e8e3] shadow-xs">
              <div className="text-[11px] font-semibold text-[#526359] uppercase tracking-wider">
                Total Faculty
              </div>
              <div className="text-xl font-bold text-[#0a241b] mt-1">
                {facultyList.filter((f) => f.active).length}{' '}
                <span className="text-xs font-normal text-[#526359]">members</span>
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-[#e2e8e3] shadow-xs">
              <div className="text-[11px] font-semibold text-[#526359] uppercase tracking-wider">
                Total Raised
              </div>
              <div className="text-xl font-bold text-[#155e42] mt-1">
                {formatKg(totalFacultyKg)}
              </div>
            </div>
          </div>

          {/* Roster Picker Card */}
          <div className="bg-white rounded-2xl border border-[#e2e8e3] shadow-xs overflow-hidden flex flex-col h-[520px]">
            <div className="p-3.5 border-b border-[#e2e8e3] bg-gray-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0a241b] flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#155e42]" />
                  Select Faculty Member
                </span>
                <span className="text-[11px] text-[#526359]">
                  {filteredFaculty.length} available
                </span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by name or designation..."
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#155e42] focus:border-[#155e42]"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {filteredFaculty.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  No matching faculty members found.
                </div>
              ) : (
                filteredFaculty.map((f) => {
                  const isSelected = f.id === selectedFacultyId;
                  const hasContributed = (f.contributionCount || 0) > 0;

                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setSelectedFacultyId(f.id);
                        setError(null);
                      }}
                      className={`w-full text-left p-3.5 transition-colors flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-50/80 border-l-4 border-l-[#155e42]'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? 'bg-[#155e42] text-white'
                              : hasContributed
                              ? 'bg-emerald-100 text-[#155e42]'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {f.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#0a241b] truncate">
                            {f.name}
                          </div>
                          <div className="text-[11px] text-[#526359] truncate flex items-center gap-1.5">
                            <span>{f.designation}</span>
                            {f.department && (
                              <>
                                <span>•</span>
                                <span className="text-gray-400">{f.department}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {hasContributed ? (
                          <div className="text-xs font-bold text-[#155e42]">
                            {formatKg(f.totalEquivalentKg || 0)}
                          </div>
                        ) : (
                          <div className="text-[11px] text-gray-400">0 kg</div>
                        )}
                        <div className="text-[10px] text-gray-400">
                          {f.contributionCount || 0} entries
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Entry Form */}
        <div className="w-full lg:w-7/12">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-[#e2e8e3] shadow-xs p-5 sm:p-7 space-y-6"
          >
            {/* Selected Contributor Header */}
            <div className="p-4 rounded-xl bg-[#f4f7f4] border border-[#e2e8e3] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#155e42] text-white font-black flex items-center justify-center text-sm">
                  {selectedFaculty ? selectedFaculty.name.charAt(0) : '?'}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0a241b]">
                    {selectedFaculty ? selectedFaculty.name : 'No Faculty Selected'}
                  </div>
                  <div className="text-[11px] text-[#526359]">
                    {selectedFaculty
                      ? `${selectedFaculty.designation} • ${selectedFaculty.department}`
                      : 'Please choose a faculty member from the list on the left'}
                  </div>
                </div>
              </div>

              {selectedFaculty && (
                <div className="text-right">
                  <div className="text-[11px] text-[#526359]">Current Total</div>
                  <div className="text-xs font-bold text-[#155e42]">
                    {formatKg(selectedFaculty.totalEquivalentKg || 0)}
                  </div>
                </div>
              )}
            </div>

            {/* Contribution Type Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0a241b] block">
                Contribution Mode <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setContributionType('grain')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    contributionType === 'grain'
                      ? 'border-[#155e42] bg-emerald-50/50 text-[#155e42] font-bold shadow-xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Wheat className="w-4 h-4" />
                  <span className="text-xs">Food Grains</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContributionType('money')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    contributionType === 'money'
                      ? 'border-[#155e42] bg-emerald-50/50 text-[#155e42] font-bold shadow-xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span className="text-xs">Monetary (₹)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContributionType('both')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    contributionType === 'both'
                      ? 'border-[#155e42] bg-emerald-50/50 text-[#155e42] font-bold shadow-xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span className="text-xs">Grain + Money</span>
                </button>
              </div>
            </div>

            {/* Inputs Section */}
            <div className="space-y-4">
              {/* Grain Quantity Input */}
              {(contributionType === 'grain' || contributionType === 'both') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#0a241b]">
                      Grain Quantity (KG) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-[#526359]">Direct 1:1 equivalent</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="e.g. 10.5"
                      value={grainQuantityKg}
                      onChange={(e) => setGrainQuantityKg(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#155e42]/20 focus:border-[#155e42]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                      KG
                    </span>
                  </div>
                </div>
              )}

              {/* Monetary Input */}
              {(contributionType === 'money' || contributionType === 'both') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#0a241b]">
                      Monetary Contribution (₹) <span className="text-red-500">*</span>
                    </label>
                    {campaign && campaign.moneyToKgRate && (
                      <span className="text-[11px] text-[#155e42] font-medium">
                        Rate: ₹{campaign.moneyToKgRate} = 1 KG
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="e.g. 500"
                      value={moneyAmount}
                      onChange={(e) => setMoneyAmount(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#155e42]/20 focus:border-[#155e42]"
                    />
                  </div>
                  {campaign && campaign.moneyToKgRate && moneyAmount && parseFloat(moneyAmount) > 0 && (
                    <div className="text-[11px] text-[#526359] flex items-center gap-1.5 pt-0.5">
                      <span className="font-semibold text-[#155e42]">
                        ≈ {formatKg(parseFloat(moneyAmount) / campaign.moneyToKgRate)}
                      </span>
                      <span>grain equivalent will be credited.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Mandatory Payment Proof Screenshot Dropzone */}
              {(contributionType === 'money' || contributionType === 'both') && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#0a241b] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#155e42]" />
                      Payment Screenshot Verification <span className="text-red-500">* (Mandatory)</span>
                    </label>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      Required for Money
                    </span>
                  </div>
                  <p className="text-[11px] text-[#526359]">
                    Upload transaction screenshot (PNG, JPEG, HEIC, SVG). The image is automatically compressed in your browser before upload.
                  </p>

                  {imageError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{imageError}</span>
                    </div>
                  )}

                  {!paymentProofUrl ? (
                    <div
                      onDragEnter={() => setDragActive(true)}
                      onDragLeave={() => setDragActive(false)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                      }}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                        dragActive
                          ? 'border-[#155e42] bg-emerald-50/50'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                      }`}
                    >
                      {compressingImage ? (
                        <div className="space-y-2">
                          <RefreshCw className="w-6 h-6 text-[#155e42] animate-spin mx-auto" />
                          <div className="text-xs font-semibold text-[#0a241b]">
                            Compressing image...
                          </div>
                          <div className="text-[10px] text-[#526359]">
                            Optimizing resolution and file size for database storage
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#155e42] flex items-center justify-center mx-auto">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-[#155e42] hover:underline cursor-pointer">
                              <span>Choose screenshot</span>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,.heic,.heif"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </label>
                            <span className="text-xs text-gray-500"> or drag and drop here</span>
                          </div>
                          <div className="text-[10px] text-gray-400">
                            PNG, JPEG, HEIF, SVG • Auto-compressed to WebP/JPEG under 100 KB
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border border-emerald-200 bg-emerald-50/30 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-[#0a241b]">
                            Screenshot Processed & Verified
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentProofUrl(null);
                            setCompressionStats(null);
                          }}
                          className="text-xs text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>

                      {compressionStats && (
                        <div className="flex items-center gap-3 text-[11px] text-[#526359] bg-white p-2.5 rounded-lg border border-gray-100">
                          <div>
                            Original: <span className="font-semibold">{formatBytes(compressionStats.originalSize)}</span>
                          </div>
                          <span>→</span>
                          <div>
                            Compressed:{' '}
                            <span className="font-semibold text-emerald-700">
                              {formatBytes(compressionStats.compressedSize)}
                            </span>
                          </div>
                          <span className="ml-auto font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {compressionStats.reduction}% saved
                          </span>
                        </div>
                      )}

                      {/* Thumbnail preview */}
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 max-h-40 bg-black/5 flex items-center justify-center">
                        <img
                          src={paymentProofUrl}
                          alt="Proof preview"
                          className="max-h-40 object-contain mx-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0a241b] block">
                  Remarks / Notes <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Received via UPI / Cheque No. / Special grain variety"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#155e42]/20 focus:border-[#155e42]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || !selectedFacultyId}
                className="w-full py-3 px-4 bg-[#155e42] hover:bg-[#0a241b] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Faculty Contribution...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Record Faculty Contribution</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
