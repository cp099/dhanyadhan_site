import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, verifyFacultyAccess } from '@/lib/auth';
import {
  getAllFaculty,
  getFaculty,
  addFaculty,
  editFaculty,
  deleteFaculty,
} from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: Sign in required.' }, { status: 401 });
  }

  if (!verifyFacultyAccess(user)) {
    return NextResponse.json(
      { error: 'Forbidden: Faculty or SDG Admin authorization required.' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const member = await getFaculty(id);
    if (!member) {
      return NextResponse.json({ error: 'Faculty member not found.' }, { status: 404 });
    }
    return NextResponse.json({ faculty: member });
  }

  const list = await getAllFaculty();
  return NextResponse.json({ faculty: list });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!verifyFacultyAccess(user)) {
    return NextResponse.json(
      { error: 'Forbidden: Only SDG Admins and Faculty Coordinators can add faculty.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { name, designation, employeeId, department, email, phone } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Faculty name is required.' }, { status: 400 });
    }
    if (!designation || !designation.trim()) {
      return NextResponse.json({ error: 'Faculty designation is required.' }, { status: 400 });
    }

    const member = await addFaculty({
      name,
      designation,
      employeeId,
      department,
      email,
      phone,
      actor: { uid: user.uid, email: user.email },
    });

    return NextResponse.json({ success: true, faculty: member }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add faculty member.' },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!verifyFacultyAccess(user)) {
    return NextResponse.json(
      { error: 'Forbidden: Only SDG Admins and Faculty Coordinators can edit faculty records.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { id, name, designation, employeeId, department, email, phone, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Faculty ID is required.' }, { status: 400 });
    }

    const updated = await editFaculty(id, {
      name,
      designation,
      employeeId,
      department,
      email,
      phone,
      active,
      actor: { uid: user.uid, email: user.email },
    });

    return NextResponse.json({ success: true, faculty: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update faculty member.' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!verifyFacultyAccess(user)) {
    return NextResponse.json(
      { error: 'Forbidden: Only SDG Admins and Faculty Coordinators can deactivate faculty.' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Faculty ID is required.' }, { status: 400 });
    }

    await deleteFaculty(id, { uid: user.uid, email: user.email });
    return NextResponse.json({ success: true, message: 'Faculty member deactivated.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to deactivate faculty member.' },
      { status: 400 }
    );
  }
}
