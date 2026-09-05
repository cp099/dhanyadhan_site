import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { seedDevelopmentData } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  // Security Hardening: Strictly require authenticated SDG Admin in all environments
  const user = await getCurrentUser(req);
  if (!user || user.role !== 'sdg_admin') {
    return NextResponse.json({ error: 'Forbidden: SDG Admin authentication required.' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const result = await seedDevelopmentData({
      applyDemoCampaignConfig: body.applyDemoCampaignConfig ?? true,
      sampleStudentsPerClass: body.sampleStudentsPerClass ?? 5,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
