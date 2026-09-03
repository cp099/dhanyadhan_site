'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sprout, Shield, Users, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(targetEmail: string) {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.user.role === 'sdg_admin') {
        router.push('/admin');
      } else if (data.user.role === 'class_admin') {
        router.push('/cr');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError('Please enter your institutional email.');
      return;
    }
    handleLogin(email);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-[#e6e2d8] shadow-lg">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#155e42] flex items-center justify-center mx-auto mb-4 shadow-md shadow-[#155e42]/20">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a241b]">
            Dhanyadhan Portal
          </h2>
          <p className="mt-2 text-xs text-[#526359]">
            Secure role-based portal for Class Representatives and SDG Cell administrators.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#526359] uppercase tracking-wider mb-1">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@dhanyadhan.edu"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e6e2d8] text-sm focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#526359] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e6e2d8] text-sm focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#155e42] text-white font-bold text-sm hover:bg-[#0a241b] transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Role Selector */}
        <div className="pt-6 border-t border-[#e6e2d8]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#526359] block text-center mb-3">
            Quick Demonstration Access
          </span>
          <div className="space-y-2">
            <button
              onClick={() => handleLogin('sdgadmin@dhanyadhan.edu')}
              disabled={loading}
              className="w-full text-left p-3 rounded-xl border border-amber-300 bg-amber-50/50 hover:bg-amber-100/60 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-700" />
                <div>
                  <span className="text-xs font-bold text-amber-950 block">SDG Cell Director</span>
                  <span className="text-[11px] text-amber-800">Master Administrator (All 17 Classes)</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-amber-900">Enter →</span>
            </button>

            <button
              onClick={() => handleLogin('cr.2bcom.afa@dhanyadhan.edu')}
              disabled={loading}
              className="w-full text-left p-3 rounded-xl border border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/60 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">Class Representative</span>
                  <span className="text-[11px] text-emerald-800">2 BCom AFA Class Console</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-900">Enter →</span>
            </button>

            <button
              onClick={() => handleLogin('cr.1bcom.a@dhanyadhan.edu')}
              disabled={loading}
              className="w-full text-left p-3 rounded-xl border border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/60 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">Class Representative</span>
                  <span className="text-[11px] text-emerald-800">1 BCom A Class Console</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-900">Enter →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
