import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { importStudentsBatch } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user || user.role !== 'sdg_admin') {
    return NextResponse.json(
      { error: 'Forbidden: Only SDG Cell administrators can bulk-import student rosters.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { students } = body;

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: 'Invalid students payload. Must be a non-empty array.' },
        { status: 400 }
      );
    }

    const result = await importStudentsBatch(students, {
      uid: user.uid,
      email: user.email,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'CSV Import failed.' },
      { status: 400 }
    );
  }
}
