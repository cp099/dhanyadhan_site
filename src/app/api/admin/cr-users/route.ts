import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAllUsers, saveUserProfile, getClass } from '@/lib/firebase/admin';
import { UserProfile } from '@/lib/types';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user || user.role !== 'sdg_admin') {
    return NextResponse.json(
      { error: 'Forbidden: SDG Admin access required.' },
      { status: 403 }
    );
  }

  const users = await getAllUsers();
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  // Security Test 3: CR attempts to modify their own classId -> DENIED
  const user = await getCurrentUser(req);
  if (!user || user.role !== 'sdg_admin') {
    return NextResponse.json(
      { error: 'Forbidden: Only SDG Cell administrators can assign CR accounts.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { email, name, classId } = body;

    if (!email || !name || !classId) {
      return NextResponse.json(
        { error: 'Email, name, and classId are required.' },
        { status: 400 }
      );
    }

    const classDoc = await getClass(classId);
    if (!classDoc) {
      return NextResponse.json({ error: 'Invalid classId.' }, { status: 400 });
    }

    const uid = `cr-${classId}-${Date.now().toString(36)}`;
    const profile: UserProfile = {
      uid,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      role: 'class_admin',
      classId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveUserProfile(profile);

    return NextResponse.json({ success: true, profile }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create CR account.' },
      { status: 400 }
    );
  }
}
