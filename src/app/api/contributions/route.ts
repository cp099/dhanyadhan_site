import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, verifyClassAccess } from '@/lib/auth';
import {
  recordContribution,
  editContribution,
  deleteContribution,
  getContributionsByClass,
  getAllContributions,
  getClass,
} from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: Sign in required.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get('classId');

  // Enforce role-based isolation (Security Tests 1 & 4)
  if (classId) {
    if (!verifyClassAccess(user, classId)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view this class records.' },
        { status: 403 }
      );
    }
    const list = await getContributionsByClass(classId);
    return NextResponse.json({ contributions: list });
  }

  // If no classId passed, only sdg_admin can list all contributions
  if (user.role !== 'sdg_admin') {
    if (user.classId) {
      const list = await getContributionsByClass(user.classId);
      return NextResponse.json({ contributions: list });
    }
    return NextResponse.json({ error: 'Forbidden: Class ID required.' }, { status: 403 });
  }

  const all = await getAllContributions();
  return NextResponse.json({ contributions: all });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: Sign in required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { studentId, classId, type, moneyAmount, grainType, grainQuantityKg, notes } = body;

    if (!studentId || !classId || !type) {
      return NextResponse.json(
        { error: 'Missing required contribution parameters.' },
        { status: 400 }
      );
    }

    // Role-based security check: CR cannot record for another class (Security Test 2)
    if (!verifyClassAccess(user, classId)) {
      return NextResponse.json(
        { error: `Forbidden: CR is not authorized to submit contributions for class "${classId}".` },
        { status: 403 }
      );
    }

    // Verify class exists
    const classDoc = await getClass(classId);
    if (!classDoc) {
      return NextResponse.json({ error: 'Invalid classId.' }, { status: 400 });
    }

    // Record contribution using server-side calculation (tampered client equivalentKg ignored!)
    const contribution = await recordContribution({
      studentId,
      classId,
      type,
      moneyAmount: Number(moneyAmount) || 0,
      grainType: grainType || null,
      grainQuantityKg: Number(grainQuantityKg) || 0,
      notes,
      actor: {
        uid: user.uid,
        email: user.email,
        name: user.name,
      },
    });

    return NextResponse.json({ success: true, contribution }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to record contribution.' },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { contributionId, classId, type, moneyAmount, grainType, grainQuantityKg, notes } = body;

    if (!contributionId || !classId) {
      return NextResponse.json(
        { error: 'contributionId and classId are required.' },
        { status: 400 }
      );
    }

    if (!verifyClassAccess(user, classId)) {
      return NextResponse.json(
        { error: 'Forbidden: You cannot modify records for this class.' },
        { status: 403 }
      );
    }

    const updated = await editContribution(contributionId, {
      type,
      moneyAmount: Number(moneyAmount) || 0,
      grainType: grainType || null,
      grainQuantityKg: Number(grainQuantityKg) || 0,
      notes,
      actor: {
        uid: user.uid,
        email: user.email,
        name: user.name,
      },
    });

    return NextResponse.json({ success: true, contribution: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update contribution.' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const contributionId = searchParams.get('id');
    const classId = searchParams.get('classId');

    if (!contributionId || !classId) {
      return NextResponse.json(
        { error: 'Both contribution ID and classId are required.' },
        { status: 400 }
      );
    }

    if (!verifyClassAccess(user, classId)) {
      return NextResponse.json(
        { error: 'Forbidden: You cannot delete records for this class.' },
        { status: 403 }
      );
    }

    await deleteContribution(contributionId, {
      uid: user.uid,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({ success: true, message: 'Contribution deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete contribution.' },
      { status: 400 }
    );
  }
}
