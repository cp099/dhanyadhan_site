import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/firebase/admin';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { AdminNavTabs } from '@/components/admin/AdminNavTabs';
import { Shield, LogOut } from 'lucide-react';

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
      {/* SDG Master Admin Sub-Header */}
      <div className="bg-[#0a241b] text-white border-b border-[#155e42]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#22c55e] to-[#155e42] text-white flex items-center justify-center font-bold shadow-md shadow-[#22c55e]/15 border border-white/10">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-black tracking-wide text-[#fbfaf7]">
                    SDG Cell Master Control Centre
                  </h1>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#155e42] text-[#86efac] font-bold border border-[#22c55e]/30">
                    Department Super-Admin
                  </span>
                </div>
                <span className="text-xs text-gray-300 block mt-0.5">
                  Department of Commerce • Central Campaign Administration
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-semibold text-gray-200 block">{user.name}</span>
                <span className="text-[11px] text-[#86efac] block">{user.email}</span>
              </div>

              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-gray-200 transition-colors border border-white/10"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>

          {/* Clean, Modern Horizontal Underline Tabs */}
          <AdminNavTabs />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  );
}
