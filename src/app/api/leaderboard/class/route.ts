import { NextRequest, NextResponse } from 'next/server';
import { getPublicClassLeaderboard } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get('classId');

  if (!classId) {
    return NextResponse.json({ error: 'classId is required.' }, { status: 400 });
  }

  const publicLeaderboard = await getPublicClassLeaderboard(classId);
  if (!publicLeaderboard) {
    return NextResponse.json({ error: 'Class leaderboard not found.' }, { status: 404 });
  }

  return NextResponse.json({ leaderboard: publicLeaderboard });
}
