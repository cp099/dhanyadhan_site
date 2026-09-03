'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';
import { OFFICIAL_CLASSES } from '@/lib/constants';
import {
  UserPlus,
  Users,
  Shield,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';

export default function AdminCrManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [classId, setClassId] = useState(OFFICIAL_CLASSES[0].id);

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/cr-users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreateCR(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !name || !classId) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/cr-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, classId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create CR account');

      setSuccessMsg(`Class Representative account assigned for ${classId}!`);
      setEmail('');
      setName('');
      await loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const crUsers = users.filter((u) => u.role === 'class_admin');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs">
        <h2 className="text-2xl font-black text-[#0a241b] flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-[#155e42]" />
          Class Representative Account Management
        </h2>
        <p className="text-xs text-[#526359] mt-1">
          Assign authorized Class Representatives to their designated Commerce classes. Each CR is strictly isolated to their assigned class.
        </p>
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

      {/* Assign / Create CR Account Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e6e2d8] shadow-xs">
        <h3 className="text-base font-bold text-[#0a241b] mb-4">
          Assign New Class Representative
        </h3>

        <form onSubmit={handleCreateCR} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#526359] uppercase tracking-wider mb-1">
                Representative Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#526359] uppercase tracking-wider mb-1">
                Institutional Email
              </label>
              <input
                type="email"
                required
                placeholder="cr.email@dhanyadhan.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#526359] uppercase tracking-wider mb-1">
                Assigned Class
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-white font-medium"
              >
                {OFFICIAL_CLASSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.year})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#155e42] text-white text-xs font-bold hover:bg-[#0a241b] transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {saving ? 'Assigning...' : 'Assign Class Representative'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing CR Accounts Directory */}
      <div className="bg-white rounded-3xl border border-[#e6e2d8] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#e6e2d8]">
          <h3 className="text-base font-bold text-[#0a241b] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#155e42]" />
            Active Class Representative Assignments ({crUsers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e6e2d8] text-[#526359] text-xs uppercase tracking-wider bg-[#fbfaf7]">
                <th className="py-3 px-4">Representative Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Assigned Class</th>
                <th className="py-3 px-4 text-center">Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f1eb]">
              {crUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-[#fbfaf7]">
                  <td className="py-3 px-4 font-bold text-[#0a241b]">{u.name}</td>
                  <td className="py-3 px-4 text-xs text-[#526359]">{u.email}</td>
                  <td className="py-3 px-4 font-semibold text-[#155e42]">{u.classId}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Scoped to {u.classId}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
