import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, getUserProfile } from '@/lib/firebase/admin';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, uid } = body;

    let user = null;

    if (uid) {
      user = await getUserProfile(uid);
    } else if (email) {
      const all = await getAllUsers();
      user = all.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials or user account not found.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true, user });

    // Set auth cookie
    response.cookies.set(AUTH_COOKIE_NAME, user.uid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Authentication failed.' },
      { status: 500 }
    );
  }
}
