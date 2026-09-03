import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserProfile } from '@/lib/firebase/admin';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import {
  Shield,
  LayoutDashboard,
  GraduationCap,
  Users,
  History,
  Settings,
  UserPlus,
  FileSpreadsheet,
  ScrollText,
  LogOut,
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const uid = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!uid) {
    redirect('/login');
  }

  const user = await getUserProfile(uid);
  if (!user || user.role !== 'sdg_admin') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      {/* SDG Master Admin Topbar */}
      <div className="bg-[#0a241b] text-white border-b border-[#155e42]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-[#fbfaf7]">
                    SDG Cell Master Control Centre
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                    Master Admin
                  </span>
                </div>
                <span className="text-xs text-gray-300">
                  Department of Commerce • Departmental Super-Admin
                </span>
              </div>
            </div>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-gray-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </form>
          </div>

          {/* Admin Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 mt-5 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold">
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <LayoutDashboard className="w-4 h-4" />
              Command Center
            </Link>
            <Link
              href="/admin/classes"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <GraduationCap className="w-4 h-4" />
              17 Classes
            </Link>
            <Link
              href="/admin/students"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Users className="w-4 h-4" />
              Student Rosters
            </Link>
            <Link
              href="/admin/contributions"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <History className="w-4 h-4" />
              All Contributions
            </Link>
            <Link
              href="/admin/campaign"
              className="px-3 py-1.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 hover:bg-amber-400/30 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              Campaign & Rules
            </Link>
            <Link
              href="/admin/cr-management"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              CR Accounts
            </Link>
            <Link
              href="/admin/reports"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Reports & CSV
            </Link>
            <Link
              href="/admin/audit-logs"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <ScrollText className="w-4 h-4" />
              Audit Logs
            </Link>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  );
}
