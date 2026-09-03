import React from 'react';
import Link from 'next/link';
import { Sprout, ShieldCheck, HeartHandshake, Code2, ExternalLink } from 'lucide-react';

function GithubIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
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

export function Footer() {
  return (
    <footer className="bg-[#0a241b] text-white border-t border-[#155e42]/40 mt-16">
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#22c55e] to-[#155e42] flex items-center justify-center shadow-md">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-wider text-[#fbfaf7]">
                DHANYADHAN
              </span>
            </div>
            <p className="text-gray-300 text-xs leading-relaxed">
              Institutional social-impact campaign uniting 17 Commerce classes to alleviate hunger and foster sustainable community nourishment.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#86efac] font-medium">
              <HeartHandshake className="w-4 h-4 text-[#22c55e]" />
              <span>17 Classes • One Departmental Goal</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#86efac] mb-3">
              Campaign Navigation
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <Link href="/#progress" className="hover:text-white transition-colors">
                  Campaign Progress
                </Link>
              </li>
              <li>
                <Link href="/#leaderboard" className="hover:text-white transition-colors">
                  Department Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-white transition-colors">
                  About & SDG Mission
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Sign In (CR & Admin Portal)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Governance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#86efac] mb-3">
              Institutional Policies
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li className="pt-2">
                <div className="flex items-start gap-1.5 text-[11px] text-amber-200/90 leading-tight">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>Public Donor Privacy Guaranteed (Amounts strictly confidential)</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Development */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#86efac] mb-3">
              Engineering
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <Link
                  href="/developer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5 text-[#86efac]" />
                  <span>About the Developer</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/cp099"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
                >
                  <GithubIcon className="w-3.5 h-3.5 text-gray-400" />
                  <span>GitHub: cp099</span>
                  <ExternalLink className="w-3 h-3 text-gray-500" />
                </a>
              </li>
              <li className="text-[11px] text-gray-400 pt-1 leading-relaxed">
                Engineered for the Department of Commerce • SDG Cell
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-[#155e42]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Department of Commerce • SDG Cell. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Developed by</span>
            <a
              href="https://github.com/cp099"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#86efac] hover:underline font-bold inline-flex items-center gap-1"
            >
              Chirag P Patil (cp099)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
