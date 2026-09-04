'use client';

import React, { useState, useEffect } from 'react';
import { ContributionDoc } from '@/lib/types';
import { OFFICIAL_CLASSES } from '@/lib/constants';
import { formatKg, formatCurrency, formatDate } from '@/lib/utils';
import PaymentProofModal from '@/components/ui/PaymentProofModal';
import {
  History,
  Search,
  Filter,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export default function AdminContributionsPage() {
  const [contributions, setContributions] = useState<ContributionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<ContributionDoc | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [proofModalTarget, setProofModalTarget] = useState<ContributionDoc | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch('/api/contributions');
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
    loadData();
  }, []);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/contributions?id=${deleteTarget.id}&classId=${deleteTarget.classId}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete contribution');

      setSuccessMsg(`Contribution for ${deleteTarget.studentName} deleted.`);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  const filtered = contributions.filter((c) => {
    const matchesSearch =
      c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.recordedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesClass = classFilter === 'all' || c.classId === classFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs">
        <div>
          <h2 className="text-2xl font-black text-[#0a241b] flex items-center gap-2">
            <History className="w-6 h-6 text-[#155e42]" />
            Department Contribution Ledger
          </h2>
          <p className="text-xs text-[#526359] mt-1">
            Complete institutional transaction log across all 17 classes with full auditability.
          </p>
        </div>

        <a
          href="/api/reports/export?type=contribution"
          download
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#155e42] text-white text-xs font-bold hover:bg-[#0a241b] transition-colors shadow-xs"
        >
          <Download className="w-4 h-4 text-[#86efac]" />
          Export All Transactions CSV
        </a>
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

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#e6e2d8] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, recorder email, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-[#e6e2d8] rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#155e42] focus:outline-none"
          >
            <option value="all">All 17 Classes</option>
            {OFFICIAL_CLASSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-[#e6e2d8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e6e2d8] text-[#526359] text-xs uppercase tracking-wider bg-[#fbfaf7]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">Equivalent KG</th>
                <th className="py-3 px-4">Recorded By</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f1eb]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#fbfaf7] transition-colors">
                  <td className="py-3 px-4 text-xs text-[#526359] whitespace-nowrap">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-[#155e42]">{c.classId}</td>
                  <td className="py-3 px-4 font-bold text-[#0a241b]">{c.studentName}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                      {c.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-[#526359]">
                    {c.type === 'money' && (
                      <span className="text-emerald-700 font-semibold">
                        {formatCurrency(c.moneyAmount)}
                      </span>
                    )}
                    {c.type === 'grain' && (
                      <span className="text-amber-900 font-semibold">
                        {c.grainQuantityKg} KG Food Grains
                      </span>
                    )}
                    {c.type === 'both' && (
                      <span>
                        <strong className="text-emerald-700">{formatCurrency(c.moneyAmount)}</strong> +{' '}
                        <strong className="text-amber-900">{c.grainQuantityKg} KG Food Grains</strong>
                      </span>
                    )}
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
                  <td className="py-3 px-4 text-right font-black text-[#155e42] whitespace-nowrap">
                    +{formatKg(c.equivalentKg)}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#526359] truncate max-w-[150px]">
                    {c.recordedByName || c.recordedBy}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-xs text-[#526359]">
            {loading ? 'Loading ledger...' : 'No transactions recorded.'}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#e6e2d8] shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#0a241b]">Delete Contribution</h3>
            <p className="text-xs text-[#526359] leading-relaxed">
              Delete <strong>+{formatKg(deleteTarget.equivalentKg)}</strong> recorded for{' '}
              <strong>{deleteTarget.studentName}</strong> ({deleteTarget.classId})?
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
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT PROOF LIGHTBOX MODAL */}
      {proofModalTarget && (
        <PaymentProofModal
          isOpen={!!proofModalTarget}
          onClose={() => setProofModalTarget(null)}
          proofUrl={proofModalTarget.paymentProofUrl}
          studentName={proofModalTarget.studentName}
          classId={proofModalTarget.classId}
          moneyAmount={proofModalTarget.moneyAmount}
          equivalentKg={proofModalTarget.equivalentKg}
          createdAt={proofModalTarget.createdAt}
          recordedBy={proofModalTarget.recordedByName || proofModalTarget.recordedBy}
          notes={proofModalTarget.notes}
        />
      )}
    </div>
  );
}
