'use client';

import React, { useState, useEffect } from 'react';
import { CampaignConfig, AcceptedGrain } from '@/lib/types';
import { DEMO_PRESET_CAMPAIGN } from '@/lib/constants';
import {
  Settings,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Wheat,
  Coins,
  Target,
  Eye,
} from 'lucide-react';

export default function AdminCampaignPage() {
  const [config, setConfig] = useState<CampaignConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [secondaryTagline, setSecondaryTagline] = useState('');
  const [targetKg, setTargetKg] = useState<string>('');
  const [moneyToKgRate, setMoneyToKgRate] = useState<string>('');
  const [acceptedGrains, setAcceptedGrains] = useState<AcceptedGrain[]>([]);
  const [milestonesStr, setMilestonesStr] = useState<string>('');
  const [showMoneyPublicly, setShowMoneyPublicly] = useState(false);
  const [showGrainPublicly, setShowGrainPublicly] = useState(false);
  const [status, setStatus] = useState<'draft' | 'active' | 'paused' | 'completed'>('draft');
  const [institutionalMessaging, setInstitutionalMessaging] = useState('');

  // New Grain Input State
  const [newGrainName, setNewGrainName] = useState('');
  const [newGrainFactor, setNewGrainFactor] = useState('1.0');

  async function loadConfig() {
    try {
      setLoading(true);
      const res = await fetch('/api/campaign');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch campaign config');

      const c: CampaignConfig = data.config;
      setConfig(c);
      setName(c.name || 'DHANYADHAN');
      setTagline(c.tagline || 'Every Grain Counts.');
      setSecondaryTagline(c.secondaryTagline || '17 Classes. One Goal.');
      setTargetKg(c.targetKg ? String(c.targetKg) : '');
      setMoneyToKgRate(c.moneyToKgRate ? String(c.moneyToKgRate) : '');
      setAcceptedGrains(c.acceptedGrains || []);
      setMilestonesStr((c.milestones || []).join(', '));
      setShowMoneyPublicly(Boolean(c.showTotalMoneyPublicly));
      setShowGrainPublicly(Boolean(c.showTotalGrainKgPublicly));
      setStatus(c.status || 'draft');
      setInstitutionalMessaging(c.institutionalMessaging || '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConfig();
  }, []);

  function handleAddGrain(e: React.FormEvent) {
    e.preventDefault();
    if (!newGrainName.trim()) return;

    const id = newGrainName.trim().toLowerCase().replace(/\s+/g, '_');
    const factor = parseFloat(newGrainFactor) || 1.0;

    if (acceptedGrains.some((g) => g.id === id)) {
      setError(`Grain type "${newGrainName}" is already in the list.`);
      return;
    }

    setAcceptedGrains([...acceptedGrains, { id, name: newGrainName.trim(), conversionFactor: factor }]);
    setNewGrainName('');
    setNewGrainFactor('1.0');
  }

  function handleRemoveGrain(id: string) {
    setAcceptedGrains(acceptedGrains.filter((g) => g.id !== id));
  }

  function loadRecommendedDemoValues() {
    setTargetKg(String(DEMO_PRESET_CAMPAIGN.targetKg || 5000));
    setMoneyToKgRate(String(DEMO_PRESET_CAMPAIGN.moneyToKgRate || 25));
    setAcceptedGrains(DEMO_PRESET_CAMPAIGN.acceptedGrains || []);
    setMilestonesStr((DEMO_PRESET_CAMPAIGN.milestones || []).join(', '));
    setShowMoneyPublicly(true);
    setShowGrainPublicly(true);
    setStatus('active');
    setSuccessMsg('Loaded recommended demonstration values. Click "Save Configuration" to apply.');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const parsedMilestones = milestonesStr
        .split(',')
        .map((s) => parseFloat(s.trim()))
        .filter((n) => !isNaN(n) && n > 0)
        .sort((a, b) => a - b);

      const payload: Partial<CampaignConfig> = {
        name: name.trim(),
        tagline: tagline.trim(),
        secondaryTagline: secondaryTagline.trim(),
        targetKg: targetKg ? parseFloat(targetKg) : null,
        moneyToKgRate: moneyToKgRate ? parseFloat(moneyToKgRate) : null,
        acceptedGrains,
        milestones: parsedMilestones,
        showTotalMoneyPublicly: showMoneyPublicly,
        showTotalGrainKgPublicly: showGrainPublicly,
        status,
        institutionalMessaging: institutionalMessaging.trim(),
        isConfigured:
          Boolean(targetKg) &&
          parseFloat(targetKg) > 0 &&
          Boolean(moneyToKgRate) &&
          parseFloat(moneyToKgRate) > 0 &&
          acceptedGrains.length > 0,
      };

      const res = await fetch('/api/campaign', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update campaign configuration');

      setConfig(data.config);
      setSuccessMsg('Campaign configuration saved and applied across the platform!');
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#e6e2d8] shadow-xs">
        <div>
          <h2 className="text-2xl font-black text-[#0a241b] flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#155e42]" />
            Campaign Configuration & Conversion Engine
          </h2>
          <p className="text-xs text-[#526359] mt-1">
            Configure institutional branding, targets, conversion multipliers, and public metrics visibility.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRecommendedDemoValues}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-950 text-xs font-bold hover:bg-amber-100 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          Load Demo Presets
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
        {/* Section 1: Campaign Identity & Branding */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e6e2d8] shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#0a241b] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#155e42]" />
            Campaign Identity & Status
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#526359] uppercase tracking-wider mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="DHANYADHAN"
                className="w-full px-3 py-2 text-sm border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#526359] uppercase tracking-wider mb-1">
                Campaign Lifecycle Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-white font-medium"
              >
                <option value="draft">Draft (Setup in progress)</option>
                <option value="active">Active (Public campaign live)</option>
                <option value="paused">Paused (Submissions frozen)</option>
                <option value="completed">Completed (Campaign concluded)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#526359] uppercase tracking-wider mb-1">
                Primary Campaign Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Every Grain Counts."
                className="w-full px-3 py-2 text-sm border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#526359] uppercase tracking-wider mb-1">
                Secondary Campaign Tagline
              </label>
              <input
                type="text"
                value={secondaryTagline}
                onChange={(e) => setSecondaryTagline(e.target.value)}
                placeholder="17 Classes. One Goal."
                className="w-full px-3 py-2 text-sm border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Department Target & Money Conversion Rule */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e6e2d8] shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#0a241b] flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-600" />
            Target & Monetary Conversion
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#526359] uppercase tracking-wider mb-1">
                Department Collective Target (KG)
              </label>
              <input
                type="number"
                step="100"
                min="0"
                placeholder="e.g. 5000"
                value={targetKg}
                onChange={(e) => setTargetKg(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7]"
              />
              <span className="text-[11px] text-[#526359] mt-1 block">
                Target belongs to the entire department (all 17 classes combined).
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#526359] uppercase tracking-wider mb-1">
                Money-to-KG Conversion Rate (₹ per 1 KG)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  placeholder="e.g. 25"
                  value={moneyToKgRate}
                  onChange={(e) => setMoneyToKgRate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7]"
                />
              </div>
              <span className="text-[11px] text-[#526359] mt-1 block">
                Example: If set to 25, a student's ₹500 donation equals 20 Equivalent KG.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#526359] uppercase tracking-wider mb-1">
              Campaign Milestones (Comma separated KG values)
            </label>
            <input
              type="text"
              placeholder="500, 1000, 2500, 5000"
              value={milestonesStr}
              onChange={(e) => setMilestonesStr(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#e6e2d8] rounded-xl focus:ring-2 focus:ring-[#155e42] focus:outline-none bg-[#fbfaf7]"
            />
          </div>
        </div>

        {/* Section 3: Accepted Food Grains & Factors */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e6e2d8] shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#0a241b] flex items-center gap-2">
            <Wheat className="w-5 h-5 text-amber-700" />
            Accepted Food Grains & Impact Multipliers
          </h3>

          <div className="space-y-2">
            {acceptedGrains.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#fbfaf7] border border-[#e6e2d8]"
              >
                <div>
                  <span className="font-bold text-sm text-[#0a241b]">{g.name}</span>
                  <span className="text-xs text-[#526359] ml-2">
                    Multiplier: <strong>{g.conversionFactor}x</strong> (1 KG = {g.conversionFactor} Equivalent KG)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveGrain(g.id)}
                  className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                  title="Remove grain"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Grain */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Grain Name (e.g. Rice, Wheat, Dal)"
              value={newGrainName}
              onChange={(e) => setNewGrainName(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-[#e6e2d8] rounded-xl bg-[#fbfaf7]"
            />
            <input
              type="number"
              step="0.1"
              min="0.1"
              placeholder="Multiplier"
              value={newGrainFactor}
              onChange={(e) => setNewGrainFactor(e.target.value)}
              className="w-28 px-3 py-2 text-sm border border-[#e6e2d8] rounded-xl bg-[#fbfaf7]"
            />
            <button
              type="button"
              onClick={handleAddGrain}
              className="px-4 py-2 rounded-xl bg-[#155e42] text-white text-xs font-bold hover:bg-[#0a241b] flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Grain
            </button>
          </div>
        </div>

        {/* Section 4: Public Visibility Toggles */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e6e2d8] shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#0a241b] flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Public Metric Visibility Controls
          </h3>
          <p className="text-xs text-[#526359]">
            Configure which aggregate metrics should be visible to the general public on the homepage.
          </p>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-2xl border border-[#e6e2d8] bg-[#fbfaf7] cursor-pointer">
              <input
                type="checkbox"
                checked={showMoneyPublicly}
                onChange={(e) => setShowMoneyPublicly(e.target.checked)}
                className="w-4 h-4 text-[#155e42] rounded-sm focus:ring-[#155e42]"
              />
              <div>
                <span className="text-xs font-bold text-[#0a241b] block">
                  Show Total Money Raised Publicly
                </span>
                <span className="text-[11px] text-[#526359]">
                  If unchecked, overall monetary sum is hidden from public view and visible only to SDG Admins.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl border border-[#e6e2d8] bg-[#fbfaf7] cursor-pointer">
              <input
                type="checkbox"
                checked={showGrainPublicly}
                onChange={(e) => setShowGrainPublicly(e.target.checked)}
                className="w-4 h-4 text-[#155e42] rounded-sm focus:ring-[#155e42]"
              />
              <div>
                <span className="text-xs font-bold text-[#0a241b] block">
                  Show Total Physical Grain KG Publicly
                </span>
                <span className="text-[11px] text-[#526359]">
                  If unchecked, physical grain weight is kept internal and only the standardized Equivalent Impact score is shown.
                </span>
              </div>
            </label>
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
            {saving ? 'Saving Configuration...' : 'Save & Commit Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
