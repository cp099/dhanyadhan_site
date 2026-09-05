'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FacultyDoc } from '@/lib/types';
import { formatKg, formatCurrency } from '@/lib/utils';
import {
  GraduationCap,
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit2,
  PlusCircle,
  Users,
  Award,
  Layers,
  X,
  Phone,
  Mail,
  Briefcase,
  Wheat,
  Coins,
} from 'lucide-react';

export default function FacultyRosterPage() {
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
            name,
            designation,
            employeeId,
            email,
            phone,
            department,
            active: isActive,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update faculty member');
        setSuccessMsg(`Updated profile for ${name}`);
      } else {
        const res = await fetch('/api/faculty', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            designation,
            employeeId,
            email,
            phone,
            department,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add faculty member');
        setSuccessMsg(`Added ${name} to Department of Commerce roster`);
      }

      setIsModalOpen(false);
      await loadFaculty();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Filtered List
  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.employeeId && f.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.email && f.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && f.active) ||
      (statusFilter === 'inactive' && !f.active);

    return matchesSearch && matchesStatus;
  });

  // Metrics
  const activeFaculty = faculty.filter((f) => f.active);
  const totalRaisedKg = activeFaculty.reduce((acc, f) => acc + (f.totalEquivalentKg || 0), 0);
  const totalGrainKg = activeFaculty.reduce((acc, f) => acc + (f.totalGrainKg || 0), 0);
  const totalMoney = activeFaculty.reduce((acc, f) => acc + (f.totalMoney || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0a241b] tracking-tight">
              Faculty Directory
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#155e42] font-bold border border-emerald-200">
              Department of Commerce
            </span>
          </div>
          <p className="text-xs text-[#526359] mt-0.5">
            Manage professors, lecturers, and department staff participating in the Dhanyadhan campaign.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/faculty/contributions/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 text-[#0a241b] text-xs font-bold hover:bg-gray-50 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-[#155e42]" />
            <span>Log Contribution</span>
          </Link>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#155e42] text-white text-xs font-bold shadow-md hover:bg-[#0a241b] transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Faculty Member</span>
          </button>
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

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#e2e8e3] shadow-xs">
          <div className="text-[11px] font-semibold text-[#526359] uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#155e42]" />
            <span>Department Faculty</span>
          </div>
          <div className="text-2xl font-black text-[#0a241b] mt-1">
            {activeFaculty.length}
            <span className="text-xs font-normal text-[#526359] ml-1">active</span>
          </div>
          <div className="text-[11px] text-[#526359] mt-0.5">{faculty.length} total registered</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e2e8e3] shadow-xs">
          <div className="text-[11px] font-semibold text-[#526359] uppercase tracking-wider flex items-center gap-1.5">
            <Wheat className="w-3.5 h-3.5 text-emerald-600" />
            <span>Faculty Grain</span>
          </div>
          <div className="text-2xl font-black text-[#155e42] mt-1">
            {formatKg(totalGrainKg)}
          </div>
          <div className="text-[11px] text-[#526359] mt-0.5">Physical food grains</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e2e8e3] shadow-xs">
          <div className="text-[11px] font-semibold text-[#526359] uppercase tracking-wider flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-emerald-600" />
            <span>Faculty Money</span>
          </div>
          <div className="text-2xl font-black text-[#155e42] mt-1">
            {formatCurrency(totalMoney)}
          </div>
          <div className="text-[11px] text-[#526359] mt-0.5">Verified online receipts</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e2e8e3] shadow-xs bg-gradient-to-br from-emerald-50/50 to-white">
          <div className="text-[11px] font-semibold text-[#155e42] uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#155e42]" />
            <span>Total Campaign Credit</span>
          </div>
          <div className="text-2xl font-black text-[#0a241b] mt-1">
            {formatKg(totalRaisedKg)}
          </div>
          <div className="text-[11px] text-[#526359] mt-0.5">Grain equivalent total</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-2xl border border-[#e2e8e3] shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty by name, employee ID, designation, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#155e42] focus:border-[#155e42]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#155e42]"
          >
            <option value="all">All Faculty Status</option>
            <option value="active">Active Members Only</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Faculty Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8e3] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#526359]">
            <div className="w-8 h-8 border-2 border-[#155e42] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-xs font-semibold">Loading faculty directory...</span>
          </div>
        ) : filteredFaculty.length === 0 ? (
          <div className="p-16 text-center text-xs text-gray-400 space-y-3">
            <Users className="w-8 h-8 text-gray-300 mx-auto" />
            <p>No faculty members match your search criteria.</p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#155e42] text-white text-xs font-bold"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add First Faculty Member</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f4f7f4] border-b border-[#e2e8e3] text-[#526359] font-bold">
                <tr>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Designation & Dept</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Grain Donated</th>
                  <th className="py-3 px-4">Money Donated</th>
                  <th className="py-3 px-4">Equivalent Total</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[#0a241b]">
                {filteredFaculty.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Member */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#155e42] font-bold flex items-center justify-center text-xs shrink-0">
                          {f.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-[#0a241b]">{f.name}</div>
                          {f.employeeId && (
                            <div className="text-[10px] text-gray-400 font-mono">
                              ID: {f.employeeId}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-[#0a241b]">{f.designation}</div>
                      <div className="text-[10px] text-[#526359]">{f.department}</div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-[#526359]">
                      <div className="space-y-0.5">
                        {f.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{f.email}</span>
                          </div>
                        )}
                        {f.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                            <span>{f.phone}</span>
                          </div>
                        )}
                        {!f.email && !f.phone && <span className="text-gray-400">—</span>}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {f.active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#155e42] text-[11px] font-semibold border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Grain */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-[#0a241b]">
                      {f.totalGrainKg > 0 ? formatKg(f.totalGrainKg) : '0 kg'}
                    </td>

                    {/* Money */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-emerald-700">
                      {f.totalMoney > 0 ? formatCurrency(f.totalMoney) : '₹0'}
                    </td>

                    {/* Equivalent Total */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-xs text-[#155e42]">
                        {formatKg(f.totalEquivalentKg || 0)}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {f.contributionCount || 0} donations
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1">
                      <button
                        onClick={() => openEditModal(f)}
                        title="Edit Faculty Member"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#155e42] hover:bg-gray-100 transition-colors inline-block"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Faculty Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#155e42]" />
                <h3 className="text-sm font-bold text-[#0a241b]">
                  {editingFaculty ? 'Edit Faculty Profile' : 'Add New Faculty Member'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#0a241b] block mb-1">
                  Full Name & Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sunita Raman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#155e42]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#0a241b] block mb-1">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Professor & HOD"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#155e42]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0a241b] block mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-101"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#155e42]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0a241b] block mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#155e42]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#0a241b] block mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    placeholder="name@dhanyadhan.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#155e42]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0a241b] block mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#155e42]"
                  />
                </div>
              </div>

              {editingFaculty && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveFaculty"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-gray-300 text-[#155e42] focus:ring-[#155e42]"
                  />
                  <label htmlFor="isActiveFaculty" className="text-xs font-medium text-[#0a241b]">
                    Active Department Member
                  </label>
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="flex-1 py-2 text-xs font-bold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-xs font-bold rounded-xl bg-[#155e42] hover:bg-[#0a241b] text-white shadow-sm disabled:opacity-50"
                >
                  {submitting
                    ? 'Saving...'
                    : editingFaculty
                    ? 'Save Profile'
                    : 'Add Faculty Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
