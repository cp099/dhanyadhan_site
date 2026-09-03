import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, EyeOff, UserCheck, Database } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Dhanyadhan',
  description: 'Privacy policy and public confidentiality commitments for the Dhanyadhan platform.',
};

export default function PrivacyPage() {
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

      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#e6e2d8] shadow-xs space-y-8">
        {/* Header */}
        <div className="pb-6 border-b border-[#f0ede6]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#155e42]/10 text-[#155e42] text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4 text-[#155e42]" />
            Data Protection & Public Confidentiality
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0a241b] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#526359] mt-2">
            Last Updated: September 2026 • Governed by Department of Commerce / SDG Cell
          </p>
        </div>

        {/* Section 1: Institutional Privacy Philosophy */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0a241b] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#155e42]" />
            1. Core Public Privacy Guarantee
          </h2>
          <p className="text-xs sm:text-sm text-[#526359] leading-relaxed">
            The Dhanyadhan platform is founded on the inviolable principle that social impact giving is an act of
            community solidarity, not a competitive display of wealth or financial capacity. Under no circumstances
            are individual student monetary contributions, rupee amounts, or physical grain kilogram weights
            disclosed on public interfaces or public API endpoints.
          </p>
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <strong className="block font-bold">Public Data Minimization Rule:</strong>
            <span>
              Public class-level student rankings display <em>only</em> student names and relative ordinal rankings
              within their respective cohort. All financial numbers and physical weight quantities are strictly stripped
              at the server tier before public distribution.
            </span>
          </div>
        </section>

        {/* Section 2: Data Collected */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0a241b] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#155e42]" />
            2. Information Collected & Managed
          </h2>
          <p className="text-xs sm:text-sm text-[#526359] leading-relaxed">
            To coordinate the campaign across all 17 Commerce classes and approximately 1,360 enrolled students,
            the system records:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-[#526359] space-y-1.5 leading-relaxed">
            <li>
              <strong>Student Identification:</strong> Full Name, institutional Roll Number/Registration ID, and
              assigned Commerce Class (e.g., 2 BCom AFA, 1 BCom Regular, MCom).
            </li>
            <li>
              <strong>Contribution Records:</strong> Contribution mode (Food Grain, Monetary Support, or Both),
              verified quantity or amount, timestamp, and the identity of the recording Class Representative.
            </li>
            <li>
              <strong>System Audit Trails:</strong> Timestamped record modifications, administrative actions, and
              session login events to ensure institutional governance and auditability.
            </li>
          </ul>
        </section>

        {/* Section 3: Role-Based Data Isolation */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0a241b] flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#155e42]" />
            3. Role-Based Access Controls (RBAC)
          </h2>
          <p className="text-xs sm:text-sm text-[#526359] leading-relaxed">
            Access to non-public contribution details is strictly partitioned according to authorized institutional roles:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl border border-[#e6e2d8] bg-[#fbfaf7]">
              <strong className="text-xs font-bold text-[#0a241b] block mb-1">
                Class Representatives (CRs)
              </strong>
              <p className="text-xs text-[#526359] leading-relaxed">
                Authorized CRs are cryptographically scoped strictly to their assigned class cohort. A CR cannot view,
                edit, or query student contributions from any of the other 16 classes.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[#e6e2d8] bg-[#fbfaf7]">
              <strong className="text-xs font-bold text-[#0a241b] block mb-1">
                SDG Cell Administrators
              </strong>
              <p className="text-xs text-[#526359] leading-relaxed">
                Departmental super-administrators have master oversight over all 17 classes for reconciliation, official
                reporting, and campaign parameter configuration.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Data Security & Retention */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0a241b] flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-[#155e42]" />
            4. Security Standards & Session Protection
          </h2>
          <p className="text-xs sm:text-sm text-[#526359] leading-relaxed">
            All data in transit is encrypted using modern TLS standards. Administrative sessions utilize secure,
            HTTP-only cookies resistant to cross-site scripting (XSS) and request forgery. The platform undergoes
            continuous automated security verification ensuring zero unauthorized contribution submissions or data leakage.
          </p>
        </section>

        {/* Section 5: Institutional Governance */}
        <section className="space-y-3 pt-4 border-t border-[#f0ede6]">
          <h2 className="text-sm font-bold text-[#0a241b]">
            5. Governance & Inquiries
          </h2>
          <p className="text-xs text-[#526359] leading-relaxed">
            For inquiries regarding student records, privacy compliance, or corrections, contact the
            Department of Commerce SDG Cell Secretariat via official institutional channels.
          </p>
        </section>
      </div>
    </div>
  );
}
