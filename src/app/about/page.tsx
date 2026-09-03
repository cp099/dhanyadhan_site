import React from 'react';
import Link from 'next/link';
import { Sprout, Target, ShieldCheck, HeartHandshake, Wheat, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#155e42]/10 text-[#155e42] text-xs font-bold uppercase tracking-wider mb-4">
          <Sprout className="w-4 h-4 text-[#155e42]" />
          Department of Commerce • SDG Cell
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0a241b] tracking-tight">
          About Dhanyadhan
        </h1>
        <p className="mt-4 text-lg text-[#526359] leading-relaxed">
          Uniting students, faculty, and the broader community in an institutional social-impact campaign to address hunger, foster sustainability, and champion the United Nations Sustainable Development Goals.
        </p>
      </div>

      {/* Grid of Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Pillar 1 */}
        <div className="bg-white p-8 rounded-3xl border border-[#e6e2d8] shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#155e42]/10 flex items-center justify-center text-[#155e42] mb-5">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#0a241b] mb-3">
            One Department • One Target
          </h3>
          <p className="text-sm text-[#526359] leading-relaxed">
            All 17 Commerce classes (covering BCom across all specializations and M.Com) combine their efforts toward a single departmental impact target. There are no segregated competitions; every contribution directly moves the whole department forward.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="bg-white p-8 rounded-3xl border border-[#e6e2d8] shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-700 mb-5">
            <Wheat className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#0a241b] mb-3">
            Dual Contribution Model
          </h3>
          <p className="text-sm text-[#526359] leading-relaxed">
            Students can contribute approved physical food grains (such as rice, wheat, and pulses) or monetary support. An official server-calculated Equivalent Impact KG metric standardizes contributions for fair competition.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="bg-white p-8 rounded-3xl border border-[#e6e2d8] shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-[#16a34a] mb-5">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#0a241b] mb-3">
            Strict Public Privacy
          </h3>
          <p className="text-sm text-[#526359] leading-relaxed">
            Giving is an act of solidarity, not a wealth showcase. Individual student donation amounts and grain quantities are strictly protected. The public sees student names and ranks within their class, but never financial or weight numbers.
          </p>
        </div>

        {/* Pillar 4 */}
        <div className="bg-white p-8 rounded-3xl border border-[#e6e2d8] shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-700 mb-5">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#0a241b] mb-3">
            Institutional Accountability
          </h3>
          <p className="text-sm text-[#526359] leading-relaxed">
            Class Representatives directly log verified student submissions from official preloaded class rosters. Every record is stored in an auditable transaction history, ensuring full transparency for the SDG Cell.
          </p>
        </div>
      </div>

      {/* Alignment with SDGs */}
      <div className="bg-[#0a241b] text-white rounded-3xl p-8 sm:p-12 mb-16 shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[#fbfaf7]">
          Alignment with Sustainable Development Goals
        </h2>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8 max-w-3xl">
          Dhanyadhan directly advances key United Nations Sustainable Development Goals by engaging higher education students in practical community philanthropy.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white/10 p-5 rounded-2xl border border-white/15">
            <span className="text-amber-400 font-extrabold text-lg block mb-1">SDG 2: Zero Hunger</span>
            <p className="text-xs text-gray-300 leading-relaxed">
              Collecting nutritious staple grains to provide direct sustenance to vulnerable families and community feeding centers.
            </p>
          </div>
          <div className="bg-white/10 p-5 rounded-2xl border border-white/15">
            <span className="text-[#86efac] font-extrabold text-lg block mb-1">SDG 12: Responsible Consumption</span>
            <p className="text-xs text-gray-300 leading-relaxed">
              Raising awareness on food waste, equitable distribution, and mindful resource sharing across student cohorts.
            </p>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#155e42] text-white font-bold text-sm hover:bg-[#0a241b] transition-all hover:scale-105 shadow-md"
        >
          <span>Return to Campaign Leaderboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
