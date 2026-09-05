import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/firebase/admin';
import { AUTH_COOKIE_NAME, verifyFacultyAccess } from '@/lib/auth';
import { FacultyNavTabs } from '@/components/faculty/FacultyNavTabs';
import { GraduationCap } from 'lucide-react';

export default async function FacultyLayout({
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
  if (!user || !verifyFacultyAccess(user)) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      {/* Crisp Sub-Navigation Bar */}
      <div className="bg-white border-b border-[#e6e2d8] sticky top-16 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
            {/* Title & Context */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800 flex-shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-[#0a241b] tracking-tight block">
                  Faculty Control Panel
                </span>
                <span className="text-[11px] text-[#526359]">Department of Commerce</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 ml-1">
                {user.role === 'sdg_admin' ? 'Master Admin' : `Coordinator: ${user.name}`}
              </span>
            </div>

            {/* Campaign info badge */}
            <div className="text-xs text-[#526359] hidden sm:block font-medium">
              Institutional Food Grain & Donation Campaign
            </div>
          </div>

          {/* Underline Tabs */}
          <FacultyNavTabs />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
