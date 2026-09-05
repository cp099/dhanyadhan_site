import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, verifyFacultyAccess } from '@/lib/auth';
import {
  getFacultyContributions,
  recordFacultyContribution,
  editFacultyContribution,
  deleteContribution,
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

  const list = await getFacultyContributions();
  return NextResponse.json({ contributions: list });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!verifyFacultyAccess(user)) {
    return NextResponse.json(
      { error: 'Forbidden: Only SDG Admins and Faculty Coordinators can record faculty contributions.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { facultyId, type, moneyAmount, grainType, grainQuantityKg, paymentProofUrl, notes } = body;

    if (!facultyId || !type) {
      return NextResponse.json(
        { error: 'facultyId and contribution type are required.' },
        { status: 400 }
      );
    }

    // Mandatory payment proof screenshot validation for monetary entries
    const isMonetary = type === 'money' || type === 'both';
    if (isMonetary) {
      if (!paymentProofUrl || typeof paymentProofUrl !== 'string' || !paymentProofUrl.trim()) {
        return NextResponse.json(
          { error: 'Payment verification screenshot is mandatory for all monetary contributions.' },
          { status: 400 }
        );
      }

      if (
        !paymentProofUrl.startsWith('data:image/') &&
        !paymentProofUrl.startsWith('http://') &&
        !paymentProofUrl.startsWith('https://')
      ) {
        return NextResponse.json(
          { error: 'Invalid payment proof format. Must be an image data URI or URL.' },
          { status: 400 }
        );
      }

      if (paymentProofUrl.length > 800000) {
        return NextResponse.json(
          { error: 'Payment verification screenshot exceeds maximum size limit (must be compressed under 500KB).' },
          { status: 400 }
        );
      }
    }

    const contribution = await recordFacultyContribution({
      facultyId,
      type,
      moneyAmount: Number(moneyAmount) || 0,
      grainType: grainType || null,
      grainQuantityKg: Number(grainQuantityKg) || 0,
      paymentProofUrl: isMonetary ? paymentProofUrl : null,
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
      { error: error.message || 'Failed to record faculty contribution.' },
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
      { error: 'Forbidden: Only SDG Admins and Faculty Coordinators can modify faculty records.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { contributionId, type, moneyAmount, grainType, grainQuantityKg, paymentProofUrl, notes } = body;

    if (!contributionId) {
      return NextResponse.json({ error: 'contributionId is required.' }, { status: 400 });
    }

    if (paymentProofUrl) {
      if (
        !paymentProofUrl.startsWith('data:image/') &&
        !paymentProofUrl.startsWith('http://') &&
        !paymentProofUrl.startsWith('https://')
      ) {
        return NextResponse.json(
          { error: 'Invalid payment proof format. Must be an image data URI or URL.' },
          { status: 400 }
        );
      }
      if (paymentProofUrl.length > 800000) {
        return NextResponse.json(
          { error: 'Payment verification screenshot exceeds maximum size limit.' },
          { status: 400 }
        );
      }
    }

    const updated = await editFacultyContribution(contributionId, {
      type,
      moneyAmount: Number(moneyAmount) || 0,
      grainType: grainType || null,
      grainQuantityKg: Number(grainQuantityKg) || 0,
      paymentProofUrl,
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
      { error: error.message || 'Failed to update faculty contribution.' },
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
      { error: 'Forbidden: Only SDG Admins and Faculty Coordinators can delete faculty records.' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const contributionId = searchParams.get('id');

    if (!contributionId) {
      return NextResponse.json({ error: 'Contribution ID is required.' }, { status: 400 });
    }

    await deleteContribution(contributionId, {
      uid: user.uid,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({ success: true, message: 'Faculty contribution deleted.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete faculty contribution.' },
      { status: 400 }
    );
  }
}
