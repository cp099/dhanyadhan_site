import React from 'react';
import Link from 'next/link';
import {
  Code2,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  ArrowLeft,
  Cpu,
  Database,
  CheckCircle2,
  MapPin,
  Globe,
  GitBranch,
  Quote,
  Lock,
  Zap,
} from 'lucide-react';

export const metadata = {
  title: 'About the Developer | Chirag P Patil (cp099)',
  description: 'Meet Chirag P Patil (cp099), creator and lead architect of the Dhanyadhan platform for the Department of Commerce / SDG Cell.',
};

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function DeveloperPage() {
  return (
    <div className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#155e42] hover:text-[#0a241b] transition-colors bg-white px-3.5 py-2 rounded-xl border border-[#e6e2d8] shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dhanyadhan Homepage</span>
        </Link>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e6e2d8] shadow-xs relative overflow-hidden">
        {/* Decorative subtle background ambient light */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#22c55e]/10 via-emerald-100/20 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-[#f0ede6]">
          {/* Avatar + Main Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            <div className="relative">
              {/* Actual GitHub profile picture from cp099 */}
              <img
                src="https://github.com/cp099.png"
                alt="Chirag P Patil"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-emerald-500/20 border-2 border-white shadow-xl"
              />
              <span
                className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-md"
                title="Active Developer"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0a241b] tracking-tight">
                  Chirag P Patil
                </h1>
                <a
                  href="https://github.com/cp099"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#155e42] font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                >
                  <span>@cp099</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <p className="text-sm font-semibold text-[#155e42]">
                Lead Architect & Full-Stack Developer
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#526359] pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  Bangalore, India
                </span>
                <span className="text-gray-300">•</span>
                <span className="italic font-medium text-[#0a241b]">
                  &ldquo;Think Big, Think Bright&rdquo;
                </span>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap md:flex-col items-stretch gap-2.5 w-full md:w-auto">
            <a
              href="https://github.com/cp099"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0a241b] text-white hover:bg-[#155e42] text-xs font-bold transition-all shadow-xs"
            >
              <GithubIcon className="w-4 h-4 text-white" />
              <span>GitHub Profile</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>

            <a
              href="https://cp099.github.io/cp099/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#fbfaf7] hover:bg-[#f0ede6] text-[#0a241b] border border-[#e6e2d8] text-xs font-bold transition-all"
            >
              <Globe className="w-4 h-4 text-[#155e42]" />
              <span>Personal Website</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>

            <a
              href="https://github.com/cp099/dhanyadhan_site"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#155e42] border border-emerald-200 text-xs font-bold transition-all"
            >
              <GitBranch className="w-4 h-4" />
              <span>Source Repository</span>
            </a>
          </div>
        </div>

        {/* Narrative & Quote */}
        <div className="pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-3 text-xs sm:text-sm text-[#526359] leading-relaxed">
            <p>
              I architected and developed the <strong>Dhanyadhan Platform</strong> for the{' '}
              <strong className="text-[#0a241b]">Department of Commerce & SDG Cell</strong> to replace
              cumbersome manual spreadsheets with a high-performance, real-time social impact web application.
            </p>
            <p>
              The platform connects 17 Commerce cohorts, manages dual-mode contributions (grain & monetary support),
              and provides strict role-based access for Class Representatives and SDG Cell administrators, all while
              rigorously protecting individual student financial privacy.
            </p>
          </div>

          <div className="bg-[#fbfaf7] p-4 sm:p-5 rounded-2xl border border-[#e6e2d8] space-y-2">
            <Quote className="w-6 h-6 text-[#155e42]/30" />
            <p className="text-xs text-[#0a241b] font-medium leading-relaxed italic">
              &ldquo;Technology in higher education should celebrate community solidarity without turning charity
              into a competition of personal wealth.&rdquo;
            </p>
            <span className="text-[10px] text-[#526359] font-bold block uppercase tracking-wider">
              — Chirag P Patil
            </span>
          </div>
        </div>
      </div>

      {/* Engineering Scale & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] shadow-2xs text-center">
          <span className="text-2xl sm:text-3xl font-black text-[#155e42] block">17</span>
          <span className="text-xs font-bold text-[#526359] mt-1 block">Commerce Classes</span>
          <span className="text-[10px] text-gray-400 block">Unified Leaderboard</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] shadow-2xs text-center">
          <span className="text-2xl sm:text-3xl font-black text-[#155e42] block">1,360+</span>
          <span className="text-xs font-bold text-[#526359] mt-1 block">Students Managed</span>
          <span className="text-[10px] text-gray-400 block">Preloaded Rosters</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] shadow-2xs text-center">
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 block">14/14</span>
          <span className="text-xs font-bold text-[#526359] mt-1 block">Security Tests</span>
          <span className="text-[10px] text-gray-400 block">100% Automated Pass</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e6e2d8] shadow-2xs text-center">
          <span className="text-2xl sm:text-3xl font-black text-[#0a241b] block">100%</span>
          <span className="text-xs font-bold text-[#526359] mt-1 block">Private Donations</span>
          <span className="text-[10px] text-gray-400 block">Zero Public Amounts</span>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e6e2d8] shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#f0ede6]">
          <div>
            <h2 className="text-lg font-bold text-[#0a241b] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#155e42]" />
              Platform Technology Stack
            </h2>
            <p className="text-xs text-[#526359] mt-0.5">
              Production-grade software architecture built for speed, responsiveness, and zero downtime.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#fbfaf7] border border-[#e6e2d8] hover:border-[#155e42]/40 transition-colors space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-[#155e42] uppercase tracking-wider bg-[#155e42]/10 px-2 py-0.5 rounded-md">
                Application Framework
              </span>
              <Zap className="w-4 h-4 text-[#155e42]" />
            </div>
            <strong className="text-sm text-[#0a241b] block font-bold">
              Next.js 16 + React 19 + Turbopack
            </strong>
            <p className="text-xs text-[#526359] leading-relaxed">
              Full-stack server-side rendering, streaming client components, fast route caching, and sub-second page loads.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#fbfaf7] border border-[#e6e2d8] hover:border-[#155e42]/40 transition-colors space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-[#155e42] uppercase tracking-wider bg-[#155e42]/10 px-2 py-0.5 rounded-md">
                Styling & Component System
              </span>
              <Layers className="w-4 h-4 text-[#155e42]" />
            </div>
            <strong className="text-sm text-[#0a241b] block font-bold">
              Tailwind CSS v4 + Lucide Icons
            </strong>
            <p className="text-xs text-[#526359] leading-relaxed">
              Custom institutional design system tailored for commerce and sustainability with seamless mobile layout scaling.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#fbfaf7] border border-[#e6e2d8] hover:border-[#155e42]/40 transition-colors space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-[#155e42] uppercase tracking-wider bg-[#155e42]/10 px-2 py-0.5 rounded-md">
                Data Layer & Aggregation
              </span>
              <Database className="w-4 h-4 text-[#155e42]" />
            </div>
            <strong className="text-sm text-[#0a241b] block font-bold">
              Firebase & Cloud Firestore
            </strong>
            <p className="text-xs text-[#526359] leading-relaxed">
              Atomic transactions aggregating multi-class metrics, persistent data verification, and fault-tolerant state management.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#fbfaf7] border border-[#e6e2d8] hover:border-[#155e42]/40 transition-colors space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-[#155e42] uppercase tracking-wider bg-[#155e42]/10 px-2 py-0.5 rounded-md">
                Security & Tenant Scoping
              </span>
              <Lock className="w-4 h-4 text-[#155e42]" />
            </div>
            <strong className="text-sm text-[#0a241b] block font-bold">
              Scoped RBAC & Confidentiality Engine
            </strong>
            <p className="text-xs text-[#526359] leading-relaxed">
              Cryptographic class isolation preventing CR cross-cohort writes, combined with automatic public donor data stripping.
            </p>
          </div>
        </div>
      </div>

      {/* Core Architectural Pillars */}
      <div className="bg-[#0a241b] text-white rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center text-[#86efac]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Architectural Guarantees Built Into the Platform
            </h2>
            <p className="text-xs text-gray-300 mt-0.5">
              Strict engineering principles enforced across every component and API route.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-[#86efac] block">01 • Public Privacy</span>
            <strong className="text-sm text-white block">Zero Financial Disclosure</strong>
            <p className="text-xs text-gray-300 leading-relaxed">
              Individual rupee amounts and grain weights never touch public endpoints. The public sees student names and ranks only.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-[#86efac] block">02 • Tamper-Proof Math</span>
            <strong className="text-sm text-white block">Server-Authoritative Equivalence</strong>
            <p className="text-xs text-gray-300 leading-relaxed">
              All monetary-to-grain conversion math executes strictly on server endpoints, neutralizing client-side payload tampering.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-[#86efac] block">03 • Multi-Tenant RBAC</span>
            <strong className="text-sm text-white block">Isolated Class Cohorts</strong>
            <p className="text-xs text-gray-300 leading-relaxed">
              Class Representatives can only read, write, or manage students belonging to their authenticated class ID.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
