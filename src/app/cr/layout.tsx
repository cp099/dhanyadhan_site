import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserProfile, getClass } from '@/lib/firebase/admin';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { Users, PlusCircle, History, UserCheck, LogOut, ShieldAlert } from 'lucide-react';

export default async function CrLayout({
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
  if (!user) {
    redirect('/login');
  }

  // If user is sdg_admin, let them access CR view with a default or selected class
  const classId = user.classId || '2-bcom-afa';
  const classDoc = await getClass(classId);

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      {/* CR Portal Sub-header */}
      <div className="bg-[#0d3125] text-white border-b border-[#155e42]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#22c55e] text-[#0a241b] flex items-center justify-center font-bold">
                CR
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-[#fbfaf7]">
                    {classDoc?.name || 'Class Representative Console'}
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#155e42] text-[#86efac] font-medium">
                    {user.name}
                  </span>
                </div>
                <span className="text-xs text-gray-300">
                  Authorized Class Representative • {classDoc?.program} ({classDoc?.year})
                </span>
              </div>
            </div>

            {/* Logout / Switch */}
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

          {/* CR Navigation Tabs */}
          <nav className="flex space-x-2 mt-4 overflow-x-auto pb-1 text-sm font-medium">
            <Link
              href="/cr"
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              Class Overview
            </Link>
            <Link
              href="/cr/contributions/new"
              className="px-3.5 py-1.5 rounded-lg bg-[#22c55e] text-[#0a241b] font-bold hover:bg-[#4ade80] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Record Contribution
            </Link>
            <Link
              href="/cr/contributions"
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5"
            >
              <History className="w-4 h-4" />
              Contribution History
            </Link>
            <Link
              href="/cr/students"
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              Class Roster & Records
            </Link>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  );
}
