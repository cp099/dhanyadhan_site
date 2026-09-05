'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FacultyDoc } from '@/lib/types';
import { formatKg, formatCurrency } from '@/lib/utils';
import {
  Briefcase,
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  ExternalLink,
  Users,
  Award,
  Layers,
  X,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';

export default function AdminFacultyManagementPage() {
  const [faculty, setFaculty] = useState<FacultyDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyDoc | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Department of Commerce');
  const [isActive, setIsActive] = useState(true);

  async function loadFaculty() {
    try {
      setLoading(true);
      const res = await fetch('/api/faculty');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch faculty');
      setFaculty(data.faculty || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFaculty();
  }, []);

  function openAddModal() {
    setEditingFaculty(null);
    setName('');
    setDesignation('Assistant Professor');
    setEmployeeId('');
    setEmail('');
    setPhone('');
    setDepartment('Department of Commerce');
    setIsActive(true);
    setIsModalOpen(true);
  }

  function openEditModal(f: FacultyDoc) {
    setEditingFaculty(f);
    setName(f.name);
    setDesignation(f.designation);
    setEmployeeId(f.employeeId || '');
    setEmail(f.email || '');
    setPhone(f.phone || '');
    setDepartment(f.department || 'Department of Commerce');
    setIsActive(f.active);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !designation.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      if (editingFaculty) {
        const res = await fetch('/api/faculty', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingFaculty.id,
            name: name.trim(),
            designation: designation.trim(),
            employeeId: employeeId.trim() || undefined,
            department: department.trim(),
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            active: isActive,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update faculty member');
        setSuccessMsg(`Updated details for ${name}!`);
      } else {
        const res = await fetch('/api/faculty', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            designation: designation.trim(),
            employeeId: employeeId.trim() || undefined,
            department: department.trim(),
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add faculty member');
        setSuccessMsg(`Added ${name} to Department Faculty Roster!`);
      }

      setIsModalOpen(false);
      await loadFaculty();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleDeactivate(f: FacultyDoc) {
    try {
      const res = await fetch('/api/faculty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: f.id,
          active: !f.active,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle status');
      setSuccessMsg(`Status updated for ${f.name}.`);
      await loadFaculty();
    } catch (err: any) {
      setError(err.message);
    }
  }

  // Filtered faculty
  const filtered = faculty.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.employeeId && f.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'active' ? f.active : !f.active;
    return matchesSearch && matchesStatus;
  });

  // Metrics
  const totalFacultyCount = faculty.length;
  const activeContributors = faculty.filter((f) => f.contributionCount > 0).length;
  const totalEquivalentKg = Math.round(
    faculty.reduce((acc, f) => acc + (f.totalEquivalentKg || 0), 0) * 100
  ) / 100;
  const totalMoney = Math.round(
    faculty.reduce((acc, f) => acc + (f.totalMoney || 0), 0) * 100
  ) / 100;

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs">
        <div>
          <h2 className="text-2xl font-black text-[#0a241b] flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#155e42]" />
            Department Faculty Roster & Management
          </h2>
          <p className="text-xs text-[#526359] mt-1">
            Department of Commerce professors, instructors, and faculty advisors contributing to Dhanyadhan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/faculty"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e6e2d8] bg-white hover:bg-[#fbfaf7] text-xs font-bold text-[#155e42] shadow-2xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Faculty Console</span>
          </Link>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#155e42] hover:bg-[#0a241b] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Faculty Member</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-2 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
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

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] shadow-2xs">
          <span className="text-[11px] font-bold text-[#526359] uppercase tracking-wider block">
            Total Faculty
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0a241b]">{totalFacultyCount}</span>
            <span className="text-xs text-[#526359]">Members</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] shadow-2xs">
          <span className="text-[11px] font-bold text-[#526359] uppercase tracking-wider block">
            Faculty Contributors
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{activeContributors}</span>
            <span className="text-xs text-gray-500">
              ({totalFacultyCount ? Math.round((activeContributors / totalFacultyCount) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] shadow-2xs">
          <span className="text-[11px] font-bold text-[#526359] uppercase tracking-wider block">
            Faculty Impact Added
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#155e42]">+{formatKg(totalEquivalentKg)}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] shadow-2xs">
          <span className="text-[11px] font-bold text-[#526359] uppercase tracking-wider block">
            Faculty Monetary Total
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-800">{formatCurrency(totalMoney)}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#e6e2d8] shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, designation, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] focus:bg-white focus:ring-2 focus:ring-[#155e42] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-[#526359]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-[#e6e2d8] rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#155e42] focus:outline-none"
          >
            <option value="all">All Faculty</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Faculty Table */}
      <div className="bg-white rounded-3xl border border-[#e6e2d8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e6e2d8] text-[#526359] text-xs uppercase tracking-wider bg-[#fbfaf7]">
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Faculty Name & Dept</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-center">Entries</th>
                <th className="py-3 px-4 text-right">Total Impact</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f1eb]">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-[#fbfaf7] transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-gray-500 font-semibold">
                    {f.employeeId || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#0a241b] block">{f.name}</span>
                    <span className="text-[11px] text-[#526359]">{f.department}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-[#0a241b] font-medium">
                    {f.designation}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#526359] space-y-0.5">
                    {f.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span>{f.email}</span>
                      </div>
                    )}
                    {f.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{f.phone}</span>
                      </div>
                    )}
                    {!f.email && !f.phone && <span className="text-gray-400">—</span>}
                  </td>
                  <td className="py-3 px-4 text-center text-xs font-semibold text-gray-700">
                    {f.contributionCount || 0}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-[#155e42] whitespace-nowrap">
                    +{formatKg(f.totalEquivalentKg || 0)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        f.active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {f.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(f)}
                        className="p-1.5 text-gray-500 hover:text-[#155e42] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Faculty Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleDeactivate(f)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          f.active
                            ? 'text-gray-400 hover:text-amber-700 hover:bg-amber-50'
                            : 'text-gray-400 hover:text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title={f.active ? 'Deactivate Member' : 'Activate Member'}
                      >
                        <ShieldCheck className="w-4 h-4" />
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
            {loading ? 'Loading faculty directory...' : 'No faculty members match your criteria.'}
          </div>
        )}
      </div>

      {/* Add / Edit Faculty Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#e6e2d8] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ede6]">
              <h3 className="text-base font-black font-headline text-[#0a241b] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#155e42]" />
                <span>{editingFaculty ? 'Edit Faculty Member' : 'Add New Faculty Member'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#0a241b] uppercase tracking-wider mb-1">
                  Faculty Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sunita Raman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] focus:bg-white focus:ring-2 focus:ring-[#155e42] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0a241b] uppercase tracking-wider mb-1">
                  Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Professor & Head of Department"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] focus:bg-white focus:ring-2 focus:ring-[#155e42] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#0a241b] uppercase tracking-wider mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FAC-COM-001"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] focus:bg-white focus:ring-2 focus:ring-[#155e42] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0a241b] uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] focus:bg-white focus:ring-2 focus:ring-[#155e42] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#0a241b] uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="name@dhanyadhan.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] focus:bg-white focus:ring-2 focus:ring-[#155e42] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0a241b] uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98450 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] focus:bg-white focus:ring-2 focus:ring-[#155e42] focus:outline-none"
                  />
                </div>
              </div>

              {editingFaculty && (
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-[#e6e2d8] text-[#155e42] focus:ring-[#155e42]"
                    />
                    <span className="text-xs font-semibold text-[#0a241b]">
                      Active Status (Eligible for contribution logging)
                    </span>
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#f0ede6]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#155e42] hover:bg-[#0a241b] text-white transition-colors shadow-2xs disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingFaculty ? 'Update Member' : 'Add to Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
