'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ContributionDoc, FacultyDoc } from '@/lib/types';
import { formatKg, formatCurrency, formatDate } from '@/lib/utils';
import PaymentProofModal from '@/components/ui/PaymentProofModal';
import { compressImageFile, formatBytes } from '@/lib/imageCompression';
import {
  History,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Eye,
  X,
  GraduationCap,
  Wheat,
  Coins,
  Layers,
  Upload,
  RefreshCw,
} from 'lucide-react';

export default function FacultyContributionsHistoryPage() {
  const [contributions, setContributions] = useState<ContributionDoc[]>([]);
  const [faculty, setFaculty] = useState<FacultyDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Payment proof inspection modal
  const [proofModalTarget, setProofModalTarget] = useState<ContributionDoc | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ContributionDoc | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit modal state
  const [editTarget, setEditTarget] = useState<ContributionDoc | null>(null);
  const [editMoney, setEditMoney] = useState<string>('');
  const [editGrainQty, setEditGrainQty] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editProofUrl, setEditProofUrl] = useState<string | null>(null);
  const [compressingEditImage, setCompressingEditImage] = useState(false);
  const [editing, setEditing] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const [contrRes, facRes] = await Promise.all([
        fetch('/api/faculty/contributions'),
        fetch('/api/faculty'),
      ]);

      const contrData = await contrRes.json();
      const facData = await facRes.json();

      if (!contrRes.ok) throw new Error(contrData.error || 'Failed to fetch contributions');
      setContributions(contrData.contributions || []);
      if (facData.faculty) setFaculty(facData.faculty);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filtered contributions
  const filtered = contributions.filter((c) => {
    const name = c.facultyName || '';
    const notes = c.notes || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Handle Delete
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/faculty/contributions?id=${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete contribution');

      setSuccessMsg(
        `Contribution for ${deleteTarget.facultyName || 'Faculty Member'} deleted. Department aggregates recalculated.`
      );
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  // Open Edit Modal
  function openEdit(c: ContributionDoc) {
    setEditTarget(c);
    setEditMoney(c.moneyAmount ? String(c.moneyAmount) : '');
    setEditGrainQty(c.grainQuantityKg ? String(c.grainQuantityKg) : '');
    setEditNotes(c.notes || '');
    setEditProofUrl(c.paymentProofUrl || null);
  }

  // Edit Image Compression
  async function handleEditFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setCompressingEditImage(true);
      try {
        const res = await compressImageFile(e.target.files[0]);
        setEditProofUrl(res.dataUrl);
      } catch (err: any) {
        setError(err.message || 'Failed to compress image');
      } finally {
        setCompressingEditImage(false);
      }
    }
  }

  // Handle Edit Submit
  async function confirmEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditing(true);
    setError(null);

    try {
      const numMoney = editMoney ? parseFloat(editMoney) : 0;
      const numGrain = editGrainQty ? parseFloat(editGrainQty) : 0;

      let type = editTarget.type;
      if (numGrain > 0 && numMoney > 0) type = 'both';
      else if (numMoney > 0) type = 'money';
      else if (numGrain > 0) type = 'grain';

      const isMonetary = type === 'money' || type === 'both';
      if (isMonetary && !editProofUrl) {
        throw new Error('Payment screenshot is mandatory for monetary contributions.');
      }

      const res = await fetch('/api/faculty/contributions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributionId: editTarget.id,
          type,
          moneyAmount: numMoney,
          grainQuantityKg: numGrain,
          paymentProofUrl: isMonetary ? editProofUrl : null,
          notes: editNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update contribution');

      setSuccessMsg(`Contribution for ${editTarget.facultyName || 'Faculty Member'} updated successfully.`);
      setEditTarget(null);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEditing(false);
    }
  }

  // KPIs
  const totalEntries = contributions.length;
  const totalGrain = Math.round(contributions.reduce((acc, c) => acc + (c.grainQuantityKg || 0), 0) * 100) / 100;
  const totalMoney = Math.round(contributions.reduce((acc, c) => acc + (c.moneyAmount || 0), 0) * 100) / 100;
  const totalEquivalent = Math.round(contributions.reduce((acc, c) => acc + (c.equivalentKg || 0), 0) * 100) / 100;

  return (
    <div className="space-y-6">
      {/* Proof inspection modal */}
      <PaymentProofModal
        contribution={proofModalTarget}
        isOpen={!!proofModalTarget}
        onClose={() => setProofModalTarget(null)}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0a241b] tracking-tight">
              Faculty Contribution Ledger
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#155e42] font-bold border border-emerald-200">
              Department Records
            </span>
          </div>
          <p className="text-xs text-[#526359] mt-0.5">
            Complete transaction history of food grain and monetary support contributed by departmental faculty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/faculty/contributions/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#155e42] text-white text-xs font-bold shadow-md hover:bg-[#0a241b] transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record New Contribution</span>
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

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#e2e8e3] shadow-xs">
          <div className="text-[11px] font-semibold text-[#526359] uppercase tracking-wider">
            Total Entries
          </div>
          <div className="text-2xl font-black text-[#0a241b] mt-1">
            {totalEntries}
          </div>
          <div className="text-[11px] text-[#526359] mt-0.5">Faculty transactions</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e2e8e3] shadow-xs">
          <div className="text-[11px] font-semibold text-[#526359] uppercase tracking-wider flex items-center gap-1">
            <Wheat className="w-3.5 h-3.5 text-emerald-600" />
            <span>Physical Grain</span>
          </div>
          <div className="text-2xl font-black text-[#155e42] mt-1">
            {formatKg(totalGrain)}
          </div>
          <div className="text-[11px] text-[#526359] mt-0.5">Direct grain donated</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e2e8e3] shadow-xs">
          <div className="text-[11px] font-semibold text-[#526359] uppercase tracking-wider flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-emerald-600" />
            <span>Monetary Support</span>
          </div>
          <div className="text-2xl font-black text-[#155e42] mt-1">
            {formatCurrency(totalMoney)}
          </div>
          <div className="text-[11px] text-[#526359] mt-0.5">Verified online receipts</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e2e8e3] shadow-xs bg-gradient-to-br from-emerald-50/50 to-white">
          <div className="text-[11px] font-semibold text-[#155e42] uppercase tracking-wider flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-[#155e42]" />
            <span>Combined Equivalent</span>
          </div>
          <div className="text-2xl font-black text-[#0a241b] mt-1">
            {formatKg(totalEquivalent)}
          </div>
          <div className="text-[11px] text-[#526359] mt-0.5">Credited to campaign total</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-2xl border border-[#e2e8e3] shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by faculty name or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#155e42] focus:border-[#155e42]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#526359]" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#155e42]"
          >
            <option value="all">All Contribution Types</option>
            <option value="grain">Food Grains Only</option>
            <option value="money">Monetary Only</option>
            <option value="both">Both (Grain & Money)</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8e3] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#526359]">
            <div className="w-8 h-8 border-2 border-[#155e42] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-xs font-semibold">Loading faculty contribution ledger...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-xs text-gray-400 space-y-3">
            <History className="w-8 h-8 text-gray-300 mx-auto" />
            <p>No faculty contributions match your criteria.</p>
            <Link
              href="/faculty/contributions/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#155e42] text-white text-xs font-bold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record First Contribution</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f4f7f4] border-b border-[#e2e8e3] text-[#526359] font-bold">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Contribution Details</th>
                  <th className="py-3 px-4">Equivalent</th>
                  <th className="py-3 px-4">Payment Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[#0a241b]">
                {filtered.map((c) => {
                  const isMonetary = c.type === 'money' || c.type === 'both';
                  const facultyDoc = faculty.find((f) => f.id === c.facultyId);

                  return (
                    <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-[#526359]">
                        {formatDate(c.createdAt)}
                      </td>

                      {/* Faculty Member */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#155e42] font-bold flex items-center justify-center text-xs shrink-0">
                            {(c.facultyName || 'F').charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[#0a241b]">
                              {c.facultyName || 'Faculty Member'}
                            </div>
                            <div className="text-[10px] text-[#526359]">
                              {facultyDoc?.designation || 'Department of Commerce'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {c.type === 'grain' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-200">
                            <Wheat className="w-3 h-3" />
                            Grain
                          </span>
                        )}
                        {c.type === 'money' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#155e42] text-[11px] font-semibold border border-emerald-200">
                            <Coins className="w-3 h-3" />
                            Money
                          </span>
                        )}
                        {c.type === 'both' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-semibold border border-blue-200">
                            <Layers className="w-3 h-3" />
                            Both
                          </span>
                        )}
                      </td>

                      {/* Contribution Details */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                        <div className="space-y-0.5">
                          {c.grainQuantityKg ? (
                            <div className="font-semibold text-[#0a241b]">
                              {formatKg(c.grainQuantityKg)} grain
                            </div>
                          ) : null}
                          {c.moneyAmount ? (
                            <div className="text-emerald-700 font-semibold">
                              {formatCurrency(c.moneyAmount)}
                            </div>
                          ) : null}
                          {c.notes && (
                            <div className="text-[10px] text-gray-400 italic max-w-xs truncate">
                              "{c.notes}"
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Equivalent Kg */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-xs text-[#155e42]">
                          +{formatKg(c.equivalentKg)}
                        </span>
                      </td>

                      {/* Payment Verification Proof */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {c.paymentProofUrl ? (
                          <button
                            onClick={() => setProofModalTarget(c)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#155e42] text-[11px] font-semibold border border-emerald-200 transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>View Proof</span>
                            <Eye className="w-3 h-3 text-[#155e42]" />
                          </button>
                        ) : isMonetary ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                            <AlertCircle className="w-3 h-3" />
                            No proof
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">Physical grain receipt</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1">
                        <button
                          onClick={() => openEdit(c)}
                          title="Edit Contribution"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#155e42] hover:bg-gray-100 transition-colors inline-block"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          title="Delete Contribution"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors inline-block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-[#0a241b]">Delete Contribution?</h3>
              <p className="text-xs text-[#526359]">
                Are you sure you want to delete this contribution for{' '}
                <span className="font-semibold text-[#0a241b]">
                  {deleteTarget.facultyName || 'Faculty Member'}
                </span>
                ? This will deduct {formatKg(deleteTarget.equivalentKg)} from the departmental campaign total.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2 text-xs font-bold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#155e42]" />
                <h3 className="text-sm font-bold text-[#0a241b]">
                  Edit Faculty Contribution
                </h3>
              </div>
              <button
                onClick={() => setEditTarget(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={confirmEdit} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-[#526359]">
                Editing entry for{' '}
                <span className="font-bold text-[#0a241b]">
                  {editTarget.facultyName || 'Faculty Member'}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0a241b] block mb-1">
                  Grain Quantity (KG)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={editGrainQty}
                  onChange={(e) => setEditGrainQty(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#155e42]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0a241b] block mb-1">
                  Monetary Amount (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={editMoney}
                  onChange={(e) => setEditMoney(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#155e42]"
                />
              </div>

              {/* Payment Proof in Edit */}
              {(parseFloat(editMoney) > 0 || editProofUrl) && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-[#0a241b] flex items-center justify-between">
                    <span>Payment Screenshot Verification</span>
                    {editProofUrl && (
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        Uploaded
                      </span>
                    )}
                  </label>
                  {editProofUrl ? (
                    <div className="flex items-center gap-2 p-2 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                      <img
                        src={editProofUrl}
                        alt="Proof"
                        className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="text-xs flex-1 truncate">Payment screenshot attached</div>
                      <label className="cursor-pointer text-xs text-[#155e42] hover:underline font-semibold">
                        Replace
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="p-3 border border-dashed border-gray-300 rounded-xl text-center">
                      {compressingEditImage ? (
                        <div className="flex items-center justify-center gap-2 text-xs text-[#155e42]">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Compressing...</span>
                        </div>
                      ) : (
                        <label className="cursor-pointer text-xs font-bold text-[#155e42] hover:underline">
                          Upload verification screenshot
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditFileChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-[#0a241b] block mb-1">
                  Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#155e42]"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  disabled={editing}
                  className="flex-1 py-2 text-xs font-bold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing || compressingEditImage}
                  className="flex-1 py-2 text-xs font-bold rounded-xl bg-[#155e42] hover:bg-[#0a241b] text-white shadow-sm disabled:opacity-50"
                >
                  {editing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
