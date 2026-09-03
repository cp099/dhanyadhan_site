'use client';

import React, { useState, useEffect } from 'react';
import { CampaignConfig } from '@/lib/types';
import { formatKg } from '@/lib/utils';
import {
  Settings,
  Save,
  AlertCircle,
  CheckCircle2,
  Coins,
  Target,
  Flame,
  Sparkles,
} from 'lucide-react';

export default function AdminCampaignPage() {
  const [config, setConfig] = useState<CampaignConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Core Configurable Campaign Values
  const [targetKg, setTargetKg] = useState<string>('');
  const [moneyToKgRate, setMoneyToKgRate] = useState<string>('');

  async function loadConfig() {
    try {
      setLoading(true);
      const res = await fetch('/api/campaign');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch campaign config');

      const c: CampaignConfig = data.config;
      setConfig(c);
      setTargetKg(c.targetKg ? String(c.targetKg) : '');
      setMoneyToKgRate(c.moneyToKgRate ? String(c.moneyToKgRate) : '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConfig();
  }, []);

  // Automatically calculate 4 progression milestones (25%, 50%, 75%, 100%) based on targetKg
  const numTarget = parseFloat(targetKg) || 0;
  const autoMilestones = numTarget > 0
    ? [0.25, 0.5, 0.75, 1.0].map((p) => Math.round(numTarget * p))
    : [];

  function loadRecommendedPreset() {
    setTargetKg('5000');
    setMoneyToKgRate('25');
    setSuccessMsg('Loaded standard recommended values (5,000 KG Target • ₹25/KG). Click "Save Settings" to apply.');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const parsedTarget = targetKg ? parseFloat(targetKg) : null;
      const parsedRate = moneyToKgRate ? parseFloat(moneyToKgRate) : null;

      const payload: Partial<CampaignConfig> = {
        name: 'DHANYADHAN',
        tagline: 'Every Grain Counts.',
        secondaryTagline: '17 Classes. One Goal.',
        status: 'active',
        targetKg: parsedTarget,
        moneyToKgRate: parsedRate,
        milestones: autoMilestones,
        acceptedGrains: [{ id: 'grains', name: 'Food Grains', conversionFactor: 1.0 }],
        showTotalMoneyPublicly: true,
        showTotalGrainKgPublicly: true,
        isConfigured: Boolean(parsedTarget && parsedTarget > 0 && parsedRate && parsedRate > 0),
      };

      const res = await fetch('/api/campaign', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update campaign configuration');

      setConfig(data.config);
      setSuccessMsg('Campaign target & monetary conversion rate successfully saved and applied!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-[#526359]">Loading configuration...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs">
        <div>
          <h2 className="text-2xl font-black text-[#0a241b] flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#155e42]" />
            Campaign Target & Conversion Rules
          </h2>
          <p className="text-xs text-[#526359] mt-1">
            Configure the department impact target and the monetary conversion multiplier.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRecommendedPreset}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-2xs"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Load Recommended Preset
        </button>
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Target & Monetary Conversion Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e6e2d8] shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Target KG Input */}
            <div>
              <label className="block text-xs font-bold text-[#0a241b] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#155e42]" />
                Department Target (KG)
              </label>
              <input
                type="number"
                step="100"
                min="100"
                required
                placeholder="e.g. 5000"
                value={targetKg}
                onChange={(e) => setTargetKg(e.target.value)}
                className="w-full px-4 py-3 text-base font-bold border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7] text-[#0a241b]"
              />
              <span className="text-[11px] text-[#526359] mt-1.5 block">
                Total impact target across all 17 Commerce classes combined.
              </span>
            </div>

            {/* Money to KG Rate Input */}
            <div>
              <label className="block text-xs font-bold text-[#0a241b] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-600" />
                Money-to-KG Conversion Rate
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-base">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder="e.g. 25"
                  value={moneyToKgRate}
                  onChange={(e) => setMoneyToKgRate(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 text-base font-bold border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7] text-[#0a241b]"
                />
              </div>
              <span className="text-[11px] text-[#526359] mt-1.5 block">
                Amount in INR equal to 1 Equivalent KG (e.g. ₹{moneyToKgRate || '25'} = 1 KG).
              </span>
            </div>
          </div>

          {/* Automatically Calculated Milestones Track */}
          <div className="pt-4 border-t border-[#f4f1eb]">
            <label className="block text-xs font-bold text-[#526359] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              Automatically Calculated Milestones (System Managed)
            </label>

            {autoMilestones.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {autoMilestones.map((m, idx) => {
                  const label = ['25%', '50%', '75%', '100% Target'][idx];
                  return (
                    <div
                      key={m}
                      className="p-3 rounded-xl bg-[#fbfaf7] border border-[#e6e2d8] text-center"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#526359] block">
                        {label}
                      </span>
                      <span className="text-base font-black text-[#155e42] block mt-0.5">
                        {formatKg(m)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                Enter a Department Target above to automatically compute campaign milestones.
              </p>
            )}
            <span className="text-[11px] text-[#526359] mt-2 block">
              The system dynamically partitions milestones at 25%, 50%, 75%, and 100% of the target without manual entry.
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#155e42] text-white font-extrabold text-sm hover:bg-[#0a241b] transition-all shadow-md hover:scale-105 disabled:opacity-50"
          >
            <Save className="w-5 h-5 text-[#86efac]" />
            {saving ? 'Saving...' : 'Save & Commit Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
