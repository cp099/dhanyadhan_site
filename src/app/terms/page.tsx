import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, CheckCircle2, ShieldAlert, Scale, Target } from 'lucide-react';

export const metadata = {
  title: 'Terms of Use | Dhanyadhan',
  description: 'Terms of use and institutional rules for the Dhanyadhan platform.',
};

export default function TermsPage() {
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
            <FileText className="w-4 h-4 text-[#155e42]" />
            Institutional Governance & Guidelines
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0a241b] tracking-tight">
            Terms of Use
          </h1>
          <p className="text-xs text-[#526359] mt-2">
            Effective Date: September 2026 • Department of Commerce / SDG Cell
          </p>
        </div>

        {/* Section 1: Scope */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0a241b] flex items-center gap-2">
            <Target className="w-4 h-4 text-[#155e42]" />
            1. Institutional Scope & Purpose
          </h2>
          <p className="text-xs sm:text-sm text-[#526359] leading-relaxed">
            The Dhanyadhan web platform is an internal social-impact system deployed by the Department of Commerce
            and the SDG Cell. Access to administrative and data-logging features is strictly restricted to designated
            faculty advisors, Class Representatives (CRs), and SDG Cell coordinators. By accessing or utilizing the
            system, all users agree to adhere to these Terms of Use and institutional codes of conduct.
          </p>
        </section>

        {/* Section 2: Class Representative Mandate */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0a241b] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#155e42]" />
            2. Class Representative Fiduciary Responsibility
          </h2>
          <p className="text-xs sm:text-sm text-[#526359] leading-relaxed">
            Authorized Class Representatives bear institutional responsibility for maintaining accurate and truthful records:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-[#526359] space-y-1.5 leading-relaxed">
            <li>
              <strong>Physical Verification:</strong> All grain contributions must be physically received, inspected,
              and weighed before being recorded in the system.
            </li>
            <li>
              <strong>Monetary Custody:</strong> All monetary contributions must be collected through approved departmental
              channels and logged against the authentic contributing student.
            </li>
            <li>
              <strong>Credential Protection:</strong> CR login credentials are strictly non-transferable and must never
              be shared with unauthorized individuals or students outside the representative panel.
            </li>
          </ul>
        </section>

        {/* Section 3: Calculation & Conversion Authority */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0a241b] flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#155e42]" />
            3. Server-Authoritative Conversion Calculations
          </h2>
          <p className="text-xs sm:text-sm text-[#526359] leading-relaxed">
            All rankings and progress metrics are governed strictly by the official Equivalent Impact KG formula.
            Conversion multipliers (such as the monetary conversion rate of ₹25 = 1 Equivalent KG) are configured
            exclusively by the SDG Cell and enforced server-side. No client application or external submission can
            override or alter conversion rules.
          </p>
        </section>

        {/* Section 4: Prohibited Activities */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0a241b] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#155e42]" />
            4. Prohibited Conduct & Integrity Violations
          </h2>
          <p className="text-xs sm:text-sm text-[#526359] leading-relaxed">
            The following actions constitute serious violations of institutional integrity:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-[#526359] space-y-1.5 leading-relaxed">
            <li>Submitting fictitious or unverified contribution records.</li>
            <li>Attempting to bypass role-based security barriers or access student rosters belonging to other classes.</li>
            <li>Automated scraping, denial-of-service attacks, or tampering with public leaderboard telemetry.</li>
            <li>Publicly disclosing confidential student financial or donation figures obtained via administrative access.</li>
          </ul>
        </section>

        {/* Section 5: Campaign Finality & Corrections */}
        <section className="space-y-3 pt-4 border-t border-[#f0ede6]">
          <h2 className="text-sm font-bold text-[#0a241b]">
            5. Campaign Finality & Administrative Audit
          </h2>
          <p className="text-xs text-[#526359] leading-relaxed">
            The SDG Cell reserves the right to audit, rectify, or reverse any contribution record found to be erroneous or
            fraudulent. All final campaign tallies, certificates, and leaderboard recognitions certified by the Head of
            Department and SDG Cell Coordinator are final.
          </p>
        </section>
      </div>
    </div>
  );
}
