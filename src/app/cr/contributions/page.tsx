'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ContributionDoc } from '@/lib/types';
import { formatKg, formatCurrency, formatDate } from '@/lib/utils';
import PaymentProofModal from '@/components/ui/PaymentProofModal';
import {
  History,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit2,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Eye,
  X,
} from 'lucide-react';

export default function CrContributionsPage() {
  const [contributions, setContributions] = useState<ContributionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [userClassId, setUserClassId] = useState<string>('');

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
  const [editing, setEditing] = useState(false);

  async function loadContributions() {
    try {
      setLoading(true);
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      const classId = sessionData.user?.classId || '2-bcom-afa';
      setUserClassId(classId);

      const res = await fetch(`/api/contributions?classId=${classId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch contributions');
      setContributions(data.contributions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContributions();
  }, []);

  const filtered = contributions.filter((c) => {
    const student = c.studentName || '';
    const matchesSearch =
      student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Handle Delete
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/contributions?id=${deleteTarget.id}&classId=${userClassId}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete contribution');

      setSuccessMsg(`Contribution for ${deleteTarget.studentName} deleted. Aggregates reversed.`);
      setDeleteTarget(null);
      await loadContributions();
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
  }

  // Handle Edit Submit
  async function confirmEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditing(true);
    setError(null);

    try {
      const res = await fetch('/api/contributions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributionId: editTarget.id,
          classId: userClassId,
          type: editTarget.type,
          moneyAmount: editMoney ? parseFloat(editMoney) : 0,
          grainType: editTarget.grainType,
          grainQuantityKg: editGrainQty ? parseFloat(editGrainQty) : 0,
          notes: editNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to edit contribution');

      setSuccessMsg(`Contribution updated successfully. Aggregates recalculated.`);
      setEditTarget(null);
      await loadContributions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEditing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs">
        <div>
          <h2 className="text-2xl font-black text-[#0a241b] flex items-center gap-2">
            <History className="w-6 h-6 text-[#155e42]" />
            Class Contribution History
          </h2>
          <p className="text-xs text-[#526359] mt-1">
            Complete transaction ledger for your class. You can edit or remove records if mistakes occur.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/api/reports/export?type=contribution&classId=${userClassId}`}
            download
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e6e2d8] text-xs font-bold text-[#155e42] hover:bg-[#fbfaf7] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
          <Link
            href="/cr/contributions/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#155e42] text-white text-xs font-bold hover:bg-[#0a241b] transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-[#86efac]" />
            Add Contribution
          </Link>
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
            placeholder="Search by student name or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-[#e6e2d8] rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#155e42] focus:outline-none"
          >
            <option value="all">All Contribution Types</option>
            <option value="grain">Grain Only</option>
            <option value="money">Money Only</option>
            <option value="both">Both Money & Grain</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-[#e6e2d8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e6e2d8] text-[#526359] text-xs uppercase tracking-wider bg-[#fbfaf7]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Submitted Details</th>
                <th className="py-3 px-4 text-right">Equivalent KG</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f1eb]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#fbfaf7] transition-colors">
                  <td className="py-3 px-4 text-xs text-[#526359] whitespace-nowrap">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#0a241b]">{c.studentName}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-700">
                      {c.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-[#526359]">
                    {c.type === 'money' && (
                      <span className="font-semibold text-emerald-700">
                        {formatCurrency(c.moneyAmount)}
                      </span>
                    )}
                    {c.type === 'grain' && (
                      <span className="font-semibold text-amber-900">{c.grainQuantityKg} KG Food Grains</span>
                    )}
                    {c.type === 'both' && (
                      <span>
                        <strong className="text-emerald-700">{formatCurrency(c.moneyAmount)}</strong> +{' '}
                        <strong className="text-amber-900">{c.grainQuantityKg} KG Food Grains</strong>
                      </span>
                    )}
                    {c.notes && <span className="block text-[10px] text-gray-400 mt-0.5">{c.notes}</span>}
                    {c.paymentProofUrl && (
                      <div className="mt-1">
                        <button
                          type="button"
                          onClick={() => setProofModalTarget(c)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                          title="View Verified Payment Screenshot"
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>View Proof</span>
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-[#155e42] text-sm whitespace-nowrap">
                    +{formatKg(c.equivalentKg)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#155e42] hover:bg-gray-100 transition-colors"
                        title="Edit Record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-xs text-[#526359]">
            {loading ? 'Loading contributions...' : 'No contribution records found.'}
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#e6e2d8] shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#0a241b]">Confirm Deletion</h3>
            <p className="text-xs text-[#526359] leading-relaxed">
              Are you sure you want to delete the contribution of{' '}
              <strong>+{formatKg(deleteTarget.equivalentKg)}</strong> recorded for{' '}
              <strong>{deleteTarget.studentName}</strong>?
            </p>
            <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-xl">
              This action will atomically reverse this amount from student, class, and department totals.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#e6e2d8] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e6e2d8]">
              <h3 className="text-lg font-bold text-[#0a241b]">Edit Contribution</h3>
              <button
                onClick={() => setEditTarget(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={confirmEdit} className="space-y-4 text-xs">
              <div>
                <span className="text-[#526359] block">Student:</span>
                <strong className="text-sm text-[#0a241b]">{editTarget.studentName}</strong>
              </div>

              {(editTarget.type === 'money' || editTarget.type === 'both') && (
                <div>
                  <label className="block font-semibold text-[#526359] mb-1">
                    Money Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={editMoney}
                    onChange={(e) => setEditMoney(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e2d8] text-sm focus:ring-2 focus:ring-[#155e42] focus:outline-none"
                  />
                </div>
              )}

              {(editTarget.type === 'grain' || editTarget.type === 'both') && (
                <div>
                  <label className="block font-semibold text-[#526359] mb-1">
                    Food Grain Quantity (KG)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={editGrainQty}
                    onChange={(e) => setEditGrainQty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e2d8] text-sm focus:ring-2 focus:ring-[#155e42] focus:outline-none"
                  />
                </div>
              )}

              {editTarget.paymentProofUrl && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span className="text-[11px] font-bold text-emerald-900 truncate">
                      Payment Proof Attached
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProofModalTarget(editTarget)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300 transition-colors"
                  >
                    View Proof
                  </button>
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#526359] mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e6e2d8] text-sm focus:ring-2 focus:ring-[#155e42] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e6e2d8]">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#155e42] text-white hover:bg-[#0a241b] transition-colors"
                >
                  {editing ? 'Saving...' : 'Update & Recalculate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT PROOF LIGHTBOX MODAL */}
      {proofModalTarget && (
        <PaymentProofModal
          isOpen={!!proofModalTarget}
          onClose={() => setProofModalTarget(null)}
          contribution={proofModalTarget}
        />
      )}
    </div>
  );
}
