import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, verifyClassAccess } from '@/lib/auth';
import { getStudentsByClass, getAllStudents, addStudent } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  // Enforce Privacy Principle (Security Test 7: Public browser cannot access private student records)
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized: Private student records require authentication.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get('classId');

  if (classId) {
    // Security Test 1: CR A cannot read Class B students
    if (!verifyClassAccess(user, classId)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to access students of this class.' },
        { status: 403 }
      );
    }
    const students = await getStudentsByClass(classId);
    return NextResponse.json({ students });
  }

  // Only sdg_admin can list all students across all 17 classes
  if (user.role !== 'sdg_admin') {
    if (user.classId) {
      const students = await getStudentsByClass(user.classId);
      return NextResponse.json({ students });
    }
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const students = await getAllStudents();
  return NextResponse.json({ students });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, classId, rollNo } = body;

    if (!name || !classId) {
      return NextResponse.json(
        { error: 'Student name and classId are required.' },
        { status: 400 }
      );
    }

    if (!verifyClassAccess(user, classId)) {
      return NextResponse.json(
        { error: 'Forbidden: You cannot add students to this class.' },
        { status: 403 }
      );
    }

    const student = await addStudent({
      name,
      classId,
      rollNo,
      actor: { uid: user.uid, email: user.email },
    });

    return NextResponse.json({ success: true, student }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add student.' },
      { status: 400 }
    );
  }
}
