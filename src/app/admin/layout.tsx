import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/firebase/admin';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { AdminNavTabs } from '@/components/admin/AdminNavTabs';

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
      {/* Sleek, Crisp White Sub-Navigation Bar */}
      <div className="bg-white border-b border-[#e6e2d8] sticky top-16 z-40 shadow-xs">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
            {/* Title & Context */}
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-[#0a241b] tracking-tight">
                SDG Cell Control Centre
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[#155e42] border border-emerald-200">
                Department Super-Admin
              </span>
            </div>

            {/* User Session Info */}
            <div className="text-xs text-[#526359] hidden sm:flex items-center gap-2">
              <span>Signed in as <strong className="text-[#0a241b]">{user.email}</strong></span>
            </div>
          </div>

          {/* Clean Underline Tabs */}
          <AdminNavTabs />
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 py-8">{children}</main>
    </div>
  );
}
