import React from 'react';
import Link from 'next/link';
import {
  Code2,
  Terminal,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  ArrowLeft,
  Cpu,
  Database,
  CheckCircle2,
} from 'lucide-react';

export const metadata = {
  title: 'About the Developer | Dhanyadhan',
  description: 'Technical architecture and developer information for the Dhanyadhan platform.',
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
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#155e42] hover:underline mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Return to Dhanyadhan Homepage
      </Link>

      {/* Developer Hero Profile Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#e6e2d8] shadow-xs mb-10 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#f0ede6]">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#155e42] via-[#0d3125] to-[#0a241b] text-[#86efac] flex items-center justify-center font-black text-2xl shadow-lg border-2 border-[#86efac]/30">
              CP
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0a241b] tracking-tight">
                  Chirag P Patil
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#155e42] font-bold border border-emerald-200">
                  cp099
                </span>
              </div>
              <p className="text-xs text-[#526359] mt-1 font-medium">
                Lead Architect & Full-Stack Developer • Dhanyadhan Platform
              </p>
            </div>
          </div>

          <a
            href="https://github.com/cp099"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0a241b] text-white hover:bg-[#155e42] text-xs font-bold transition-all shadow-xs self-start sm:self-auto"
          >
            <GithubIcon className="w-4 h-4 text-white" />
            <span>github.com/cp099</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>
        </div>

        {/* Bio & Project Purpose */}
        <div className="space-y-4 text-xs sm:text-sm text-[#526359] leading-relaxed">
          <p>
            The <strong>Dhanyadhan Platform</strong> was designed and developed by{' '}
            <strong className="text-[#0a241b]">Chirag P Patil (cp099)</strong> specifically for the{' '}
            <strong>Department of Commerce / SDG Cell</strong> to coordinate an institutional-scale,
            17-class social impact initiative.
          </p>
          <p>
            The system unites over 1,360 student contributors, providing role-based portals for Class
            Representatives and Department Administrators, high-security data isolation, atomic transaction
            accounting, and a mobile-first campaign-oriented leaderboard.
          </p>
        </div>
      </div>

      {/* Engineering & Technology Stack */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#e6e2d8] shadow-xs mb-10 space-y-6">
        <h2 className="text-lg font-bold text-[#0a241b] flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#155e42]" />
          Platform Technology Stack
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#fbfaf7] border border-[#e6e2d8] space-y-1.5">
            <span className="text-[11px] font-bold text-[#155e42] uppercase tracking-wider block">
              Frontend & SSR Engine
            </span>
            <strong className="text-sm text-[#0a241b] block">Next.js 16 + React 19</strong>
            <p className="text-xs text-[#526359] leading-relaxed">
              Powered by Turbopack for ultra-fast server-side rendering, client streaming, and mobile-first responsiveness.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#fbfaf7] border border-[#e6e2d8] space-y-1.5">
            <span className="text-[11px] font-bold text-[#155e42] uppercase tracking-wider block">
              Styling & Design System
            </span>
            <strong className="text-sm text-[#0a241b] block">Tailwind CSS v4 + Lucide Icons</strong>
            <p className="text-xs text-[#526359] leading-relaxed">
              Modern institutional palette inspired by agriculture, SDG sustainability, and crisp typography.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#fbfaf7] border border-[#e6e2d8] space-y-1.5">
            <span className="text-[11px] font-bold text-[#155e42] uppercase tracking-wider block">
              Database & State Persistence
            </span>
            <strong className="text-sm text-[#0a241b] block">Firebase / Cloud Firestore</strong>
            <p className="text-xs text-[#526359] leading-relaxed">
              Atomic batch operations, multi-entity transactions, and persistent local fallback for offline robustness.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#fbfaf7] border border-[#e6e2d8] space-y-1.5">
            <span className="text-[11px] font-bold text-[#155e42] uppercase tracking-wider block">
              Security & Access Control
            </span>
            <strong className="text-sm text-[#0a241b] block">Scoped RBAC + Data Masking</strong>
            <p className="text-xs text-[#526359] leading-relaxed">
              10-point automated security test suite, strict class tenant isolation, and complete public donor privacy.
            </p>
          </div>
        </div>
      </div>

      {/* Architectural Principles */}
      <div className="bg-[#0a241b] text-white rounded-3xl p-8 sm:p-10 shadow-lg space-y-4">
        <h2 className="text-lg font-bold text-[#fbfaf7] flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#86efac]" />
          Architectural Principles Built In
        </h2>

        <ul className="space-y-3 text-xs sm:text-sm text-gray-300">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#86efac] flex-shrink-0 mt-0.5" />
            <span>
              <strong>Zero Public Financial Disclosure:</strong> Individual donation amounts and grain weights are private by design; public rankings only show names and ranks.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#86efac] flex-shrink-0 mt-0.5" />
            <span>
              <strong>Server-Authoritative Calculations:</strong> All monetary-to-grain conversion math is performed on the server; client payloads are sanitized and verified.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#86efac] flex-shrink-0 mt-0.5" />
            <span>
              <strong>Institutional Integrity:</strong> Built to serve higher education with auditable logs, multi-tenant class isolation, and SDG tracking.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
