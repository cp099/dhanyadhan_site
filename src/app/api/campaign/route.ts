import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getCampaignConfig, saveCampaignConfig } from '@/lib/firebase/admin';

export async function GET() {
  const config = await getCampaignConfig();
  return NextResponse.json({ config });
}

export async function PUT(req: NextRequest) {
  // Security Test 9: CR attempts to modify campaign target / conversion -> DENIED
  const user = await getCurrentUser(req);
  if (!user || user.role !== 'sdg_admin') {
    return NextResponse.json(
      { error: 'Forbidden: Only SDG Cell administrators can modify campaign configuration.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const updated = await saveCampaignConfig(body, {
      uid: user.uid,
      email: user.email,
    });

    return NextResponse.json({ success: true, config: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update campaign configuration.' },
      { status: 400 }
    );
  }
}
