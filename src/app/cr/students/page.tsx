'use client';

import React, { useState, useEffect } from 'react';
import { StudentDoc, ContributionDoc } from '@/lib/types';
import { formatKg, formatCurrency, formatDate } from '@/lib/utils';
import {
  UserCheck,
  Search,
  PlusCircle,
  Download,
  Eye,
  X,
  AlertCircle,
  CheckCircle2,
  Coins,
  Wheat,
} from 'lucide-react';

export default function CrStudentsPage() {
  const [students, setStudents] = useState<StudentDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userClassId, setUserClassId] = useState<string>('');

  // View Student Drilldown State
  const [activeStudent, setActiveStudent] = useState<StudentDoc | null>(null);
  const [studentHistory, setStudentHistory] = useState<ContributionDoc[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Add Student Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  const [addMsg, setAddMsg] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      const classId = sessionData.user?.classId || '2-bcom-afa';
      setUserClassId(classId);

      const res = await fetch(`/api/students?classId=${classId}`);
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
    loadData();
  }, []);

  // Drill down into student history
  async function openStudentHistory(s: StudentDoc) {
    setActiveStudent(s);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/contributions?classId=${userClassId}`);
      const data = await res.json();
      if (res.ok) {
        const studentContrs = (data.contributions || []).filter(
          (c: ContributionDoc) => c.studentId === s.id
        );
        setStudentHistory(studentContrs);
      }
    } catch {
      setStudentHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  // Handle adding student
  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    setAddingStudent(true);
    setError(null);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudentName.trim(),
          classId: userClassId,
          rollNo: newStudentRoll.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add student');

      setAddMsg(`Student "${data.student.name}" added to class roster.`);
      setNewStudentName('');
      setNewStudentRoll('');
      setAddModalOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingStudent(false);
    }
  }

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.rollNo && s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs">
        <div>
          <h2 className="text-2xl font-black text-[#0a241b] flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#155e42]" />
            Class Student Roster & Private Records
          </h2>
          <p className="text-xs text-[#526359] mt-1">
            Private administrative view of all students in your class with cumulative impact totals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/api/reports/export?type=class&classId=${userClassId}`}
            download
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e6e2d8] text-xs font-bold text-[#155e42] hover:bg-[#fbfaf7] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Class CSV
          </a>
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#155e42] text-white text-xs font-bold hover:bg-[#0a241b] transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-[#86efac]" />
            Add Student
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {addMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-xs text-emerald-900">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{addMsg}</span>
        </div>
      )}

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-[#e6e2d8] max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name or roll no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7]"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-[#e6e2d8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e6e2d8] text-[#526359] text-xs uppercase tracking-wider bg-[#fbfaf7]">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4 text-right">Physical Grain</th>
                <th className="py-3 px-4 text-right">Monetary (₹)</th>
                <th className="py-3 px-4 text-right">Equivalent Impact</th>
                <th className="py-3 px-4 text-center">Entries</th>
                <th className="py-3 px-4 text-center">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f1eb]">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-[#fbfaf7] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#0a241b]">{s.name}</td>
                  <td className="py-3 px-4 text-xs text-[#526359]">{s.rollNo || '—'}</td>
                  <td className="py-3 px-4 text-right font-medium text-amber-900">
                    {formatKg(s.totalGrainKg)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-700">
                    {formatCurrency(s.totalMoney)}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-[#155e42]">
                    {formatKg(s.totalEquivalentKg)}
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-[#526359]">
                    {s.contributionCount}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => openStudentHistory(s)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#155e42] bg-[#155e42]/10 hover:bg-[#155e42]/20 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-xs text-[#526359]">
            {loading ? 'Loading student roster...' : 'No students found.'}
          </div>
        )}
      </div>

      {/* STUDENT HISTORY DRILLDOWN MODAL */}
      {activeStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#e6e2d8] shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e2d8]">
              <div>
                <h3 className="text-lg font-bold text-[#0a241b]">{activeStudent.name}</h3>
                <span className="text-xs text-[#526359]">
                  Roll: {activeStudent.rollNo || 'N/A'} • Total Impact: {formatKg(activeStudent.totalEquivalentKg)}
                </span>
              </div>
              <button
                onClick={() => setActiveStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick cumulative summary pills */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#fbfaf7] p-3 rounded-xl border border-[#e6e2d8] flex items-center gap-2">
                <Wheat className="w-4 h-4 text-amber-700" />
                <div>
                  <span className="text-[10px] text-[#526359] block uppercase font-semibold">Total Grain</span>
                  <span className="text-sm font-bold text-amber-900">{formatKg(activeStudent.totalGrainKg)}</span>
                </div>
              </div>
              <div className="bg-[#fbfaf7] p-3 rounded-xl border border-[#e6e2d8] flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-[10px] text-[#526359] block uppercase font-semibold">Total Money</span>
                  <span className="text-sm font-bold text-emerald-700">{formatCurrency(activeStudent.totalMoney)}</span>
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#526359]">
                Transaction History ({studentHistory.length})
              </h4>
              {historyLoading ? (
                <div className="text-center py-6 text-xs text-[#526359]">Loading transactions...</div>
              ) : studentHistory.length > 0 ? (
                studentHistory.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-[#fbfaf7] border border-[#e6e2d8] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-[#0a241b] block">
                        {c.type === 'money' ? formatCurrency(c.moneyAmount) : c.type === 'grain' ? `${c.grainQuantityKg} KG ${c.grainType}` : `${formatCurrency(c.moneyAmount)} + ${c.grainQuantityKg} KG ${c.grainType}`}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {formatDate(c.createdAt)} • Logged by {c.recordedByName || c.recordedBy}
                      </span>
                    </div>
                    <span className="font-extrabold text-[#155e42] text-sm">
                      +{formatKg(c.equivalentKg)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-[#526359]">
                  No contributions recorded for this student yet.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#e6e2d8] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveStudent(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#e6e2d8] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e6e2d8]">
              <h3 className="text-lg font-bold text-[#0a241b]">Add Missing Student</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#526359] mb-1">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e6e2d8] text-sm focus:ring-2 focus:ring-[#155e42] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#526359] mb-1">
                  Roll Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. COMM-042"
                  value={newStudentRoll}
                  onChange={(e) => setNewStudentRoll(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e6e2d8] text-sm focus:ring-2 focus:ring-[#155e42] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e6e2d8]">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingStudent || !newStudentName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#155e42] text-white hover:bg-[#0a241b] transition-colors disabled:opacity-50"
                >
                  {addingStudent ? 'Adding...' : 'Add to Class Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
