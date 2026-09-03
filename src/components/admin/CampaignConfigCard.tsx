'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatKg } from '@/lib/utils';
import {
  Save,
  Target,
  Coins,
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

  // Auto-calculated milestones (25%, 50%, 75%, 100%)
  const numTarget = parseFloat(targetKg) || 0;
  const autoMilestones =
    numTarget > 0
      ? [0.25, 0.5, 0.75, 1.0].map((p) => Math.round(numTarget * p))
      : [];

  function handlePreset() {
    setTargetKg('5000');
    setMoneyToKgRate('25');
    setSuccessMsg('Applied 5,000 KG & ₹25 preset. Click "Save Parameters" to commit.');
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

      setSuccessMsg('Campaign parameters saved successfully.');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e6e2d8] p-6 shadow-2xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0ede6]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-[#0a241b]">
              Campaign Target & Monetary Conversion
            </h3>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                isConfigured
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {isConfigured ? 'Active Rules' : 'Pending Values'}
            </span>
          </div>
          <p className="text-xs text-[#526359] mt-0.5">
            Configure the central departmental goal and monetary multiplier. Milestones calculate automatically.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePreset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e6e2d8] bg-[#fbfaf7] hover:bg-white text-xs font-semibold text-[#155e42] transition-colors self-start sm:self-auto shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Preset (5,000 KG / ₹25)</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900">
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
              Department Impact Target
            </label>
            <div className="relative flex rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] focus-within:ring-2 focus-within:ring-[#155e42] focus-within:border-transparent transition-all">
              <input
                type="number"
                step="100"
                min="100"
                required
                placeholder="5000"
                value={targetKg}
                onChange={(e) => setTargetKg(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-bold bg-transparent text-[#0a241b] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="inline-flex items-center px-3.5 text-xs font-bold text-[#526359] border-l border-[#e6e2d8] bg-white rounded-r-xl">
                KG
              </span>
            </div>
            <span className="text-[11px] text-[#526359] mt-1 block">
              Cumulative target uniting all 17 Commerce classes.
            </span>
          </div>

          {/* Money to KG Rate */}
          <div>
            <label className="block text-xs font-bold text-[#0a241b] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-[#155e42]" />
              Monetary Conversion Rate
            </label>
            <div className="relative flex rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] focus-within:ring-2 focus-within:ring-[#155e42] focus-within:border-transparent transition-all">
              <span className="inline-flex items-center px-3 text-sm font-bold text-[#526359] border-r border-[#e6e2d8] bg-white rounded-l-xl">
                ₹
              </span>
              <input
                type="number"
                step="1"
                min="1"
                required
                placeholder="25"
                value={moneyToKgRate}
                onChange={(e) => setMoneyToKgRate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-bold bg-transparent text-[#0a241b] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="inline-flex items-center px-3 text-xs font-bold text-[#526359] border-l border-[#e6e2d8] bg-white rounded-r-xl whitespace-nowrap">
                = 1 KG
              </span>
            </div>
            <span className="text-[11px] text-[#526359] mt-1 block">
              A student contribution of ₹{moneyToKgRate || '25'} equals 1 Equivalent KG.
            </span>
          </div>
        </div>

        {/* Milestones Strip */}
        <div className="pt-2">
          <span className="text-[11px] font-bold text-[#526359] uppercase tracking-wider block mb-2">
            System Progression Milestones
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[0.25, 0.5, 0.75, 1.0].map((pct, idx) => {
              const val = numTarget > 0 ? Math.round(numTarget * pct) : null;
              const label = ['25%', '50%', '75%', '100% Target'][idx];
              return (
                <div
                  key={label}
                  className="p-2.5 rounded-xl border border-[#e6e2d8] bg-[#fbfaf7] text-center"
                >
                  <span className="text-[10px] font-bold text-[#526359] uppercase block">{label}</span>
                  <span className="text-sm font-extrabold text-[#155e42] block mt-0.5">
                    {val ? formatKg(val) : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-2 border-t border-[#f0ede6]">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#155e42] text-white font-bold text-xs hover:bg-[#0a241b] transition-all shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#86efac]" />
            {saving ? 'Saving...' : 'Save Parameters'}
          </button>
        </div>
      </form>
    </div>
  );
}
