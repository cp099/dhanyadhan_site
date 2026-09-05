'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sprout, Shield, Users, GraduationCap, ArrowRight, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoProfiles, setShowDemoProfiles] = useState(false);

  async function handleLogin(targetEmail: string) {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Unified redirection based on verified role & class
      if (data.user.role === 'sdg_admin') {
        router.push('/admin');
      } else if (data.user.role === 'class_admin') {
        router.push('/cr');
      } else if (data.user.role === 'faculty') {
        router.push('/faculty');
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
      setError('Please enter your institutional email address.');
      return;
    }
    handleLogin(email);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-[#e6e2d8] shadow-lg">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#155e42] flex items-center justify-center mx-auto mb-4 shadow-md shadow-[#155e42]/20">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a241b]">
            Institutional Sign In
          </h2>
          <p className="mt-2 text-xs text-[#526359] leading-relaxed">
            One unified portal for Class Representatives and SDG Cell administrators. The system automatically loads your assigned class or department workspace upon login.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Single Unified Login Form */}
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
                placeholder="your.email@dhanyadhan.edu"
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
            {loading ? 'Authenticating & Loading Workspace...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast-Fill Drawer */}
        <div className="pt-4 border-t border-[#e6e2d8]">
          <button
            type="button"
            onClick={() => setShowDemoProfiles(!showDemoProfiles)}
            className="w-full text-center text-xs text-[#155e42] font-semibold hover:underline flex items-center justify-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{showDemoProfiles ? 'Hide Quick Demo Logins' : 'Quick Demo Logins (Click to Test)'}</span>
          </button>

          {showDemoProfiles && (
            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={() => handleLogin('sdgadmin@dhanyadhan.edu')}
                disabled={loading}
                className="w-full text-left p-3 rounded-xl border border-amber-300 bg-amber-50/50 hover:bg-amber-100/60 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-700" />
                  <div>
                    <span className="text-xs font-bold text-amber-950 block">SDG Cell Director</span>
                    <span className="text-[11px] text-amber-800">Master Administrator (All 17 Classes & Faculty)</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-amber-900">Sign In →</span>
              </button>

              <button
                type="button"
                onClick={() => handleLogin('faculty@dhanyadhan.edu')}
                disabled={loading}
                className="w-full text-left p-3 rounded-xl border border-blue-300 bg-blue-50/50 hover:bg-blue-100/60 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-700" />
                  <div>
                    <span className="text-xs font-bold text-blue-950 block">Faculty Coordinator</span>
                    <span className="text-[11px] text-blue-800">Department Faculty Control Panel</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-900">Sign In →</span>
              </button>

              <button
                type="button"
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
                <span className="text-xs font-semibold text-emerald-900">Sign In →</span>
              </button>

              <button
                type="button"
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
                <span className="text-xs font-semibold text-emerald-900">Sign In →</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
