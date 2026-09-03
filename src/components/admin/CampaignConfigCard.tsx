'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatKg } from '@/lib/utils';
import {
  Settings,
  Save,
  Target,
  Coins,
  Flame,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface CampaignConfigCardProps {
  initialTargetKg: number | null;
  initialMoneyToKgRate: number | null;
  isConfigured: boolean;
}

export function CampaignConfigCard({
  initialTargetKg,
  initialMoneyToKgRate,
  isConfigured,
}: CampaignConfigCardProps) {
  const router = useRouter();
  const [targetKg, setTargetKg] = useState<string>(
    initialTargetKg ? String(initialTargetKg) : ''
  );
  const [moneyToKgRate, setMoneyToKgRate] = useState<string>(
    initialMoneyToKgRate ? String(initialMoneyToKgRate) : ''
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Automatically calculate 4 progression milestones (25%, 50%, 75%, 100%) based on targetKg
  const numTarget = parseFloat(targetKg) || 0;
  const autoMilestones =
    numTarget > 0
      ? [0.25, 0.5, 0.75, 1.0].map((p) => Math.round(numTarget * p))
      : [];

  function loadRecommendedPreset() {
    setTargetKg('5000');
    setMoneyToKgRate('25');
    setSuccessMsg('Loaded recommended values (5,000 KG Target • ₹25/KG). Click "Save Rules" to commit.');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const parsedTarget = targetKg ? parseFloat(targetKg) : null;
      const parsedRate = moneyToKgRate ? parseFloat(moneyToKgRate) : null;

      const payload = {
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
      if (!res.ok) throw new Error(data.error || 'Failed to update campaign rules');

      setSuccessMsg('Campaign rules updated successfully!');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e6e2d8] shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e6e2d8]">
        <div>
          <h3 className="text-lg font-bold text-[#0a241b] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#155e42]" />
            Campaign Target & Conversion Rules
          </h3>
          <p className="text-xs text-[#526359] mt-0.5">
            Configure the department goal and conversion rate. Milestones are automatically computed.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRecommendedPreset}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 text-xs font-bold hover:bg-emerald-100 transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Recommended (5,000 KG / ₹25)
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-xs text-emerald-900">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Target KG */}
          <div>
            <label className="block text-xs font-bold text-[#0a241b] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#155e42]" />
              Department Impact Target (KG)
            </label>
            <input
              type="number"
              step="100"
              min="100"
              required
              placeholder="e.g. 5000"
              value={targetKg}
              onChange={(e) => setTargetKg(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-bold border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7] text-[#0a241b]"
            />
            <span className="text-[11px] text-[#526359] mt-1 block">
              Combined target across all 17 Commerce classes.
            </span>
          </div>

          {/* Money to KG Rate */}
          <div>
            <label className="block text-xs font-bold text-[#0a241b] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-emerald-600" />
              Monetary Rate (₹ per 1 KG)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
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
                className="w-full pl-8 pr-3.5 py-2.5 text-sm font-bold border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7] text-[#0a241b]"
              />
            </div>
            <span className="text-[11px] text-[#526359] mt-1 block">
              Example: ₹{moneyToKgRate || '25'} donation equals 1 Equivalent KG.
            </span>
          </div>
        </div>

        {/* Auto-Calculated Milestones */}
        <div className="p-4 bg-[#fbfaf7] rounded-2xl border border-[#e6e2d8] space-y-2">
          <label className="block text-[11px] font-bold text-[#526359] uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Auto-Calculated Milestones (25% • 50% • 75% • 100%)
          </label>

          {autoMilestones.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {autoMilestones.map((m, idx) => {
                const label = ['25%', '50%', '75%', '100% Goal'][idx];
                return (
                  <div key={m} className="bg-white p-2.5 rounded-xl border border-[#e6e2d8] text-center">
                    <span className="text-[10px] font-bold text-[#526359] uppercase block">{label}</span>
                    <span className="text-sm font-black text-[#155e42] block mt-0.5">{formatKg(m)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic block">
              Enter target above to preview progression milestones.
            </span>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#155e42] text-white font-bold text-xs hover:bg-[#0a241b] transition-all shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#86efac]" />
            {saving ? 'Saving Rules...' : 'Save & Update Campaign Rules'}
          </button>
        </div>
      </form>
    </div>
  );
}
