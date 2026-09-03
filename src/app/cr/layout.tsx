import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserProfile, getClass } from '@/lib/firebase/admin';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { CrNavTabs } from '@/components/cr/CrNavTabs';

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
      {/* Crisp White Sub-Navigation Bar */}
      <div className="bg-white border-b border-[#e6e2d8] sticky top-16 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
            {/* Title & Context */}
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-[#0a241b] tracking-tight">
                {classDoc?.name || 'Class Representative Console'}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[#155e42] border border-emerald-200">
                CR: {user.name}
              </span>
            </div>

            {/* Class info */}
            <div className="text-xs text-[#526359] hidden sm:block">
              {classDoc?.program} ({classDoc?.year})
            </div>
          </div>

          {/* Clean Underline Tabs */}
          <CrNavTabs />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
