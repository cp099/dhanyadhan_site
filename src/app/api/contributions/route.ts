import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, verifyClassAccess } from '@/lib/auth';
import {
  recordContribution,
  editContribution,
  deleteContribution,
  getContributionsByClass,
  getAllContributions,
  getClass,
  getContribution,
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

function validatePaymentProof(proof: unknown): { valid: boolean; error?: string } {
  if (typeof proof !== 'string' || !proof.trim()) {
    return { valid: false, error: 'Payment verification screenshot is mandatory for all monetary contributions.' };
  }
  if (proof.length > 800000) {
    return { valid: false, error: 'Payment verification screenshot exceeds maximum size limit (under 500KB compressed).' };
  }
  if (proof.startsWith('http://')) {
    return { valid: false, error: 'Insecure HTTP URLs are not permitted. Please upload a secure image or data URI.' };
  }
  if (proof.includes('image/svg+xml') || proof.startsWith('data:image/svg')) {
    return { valid: false, error: 'SVG image format is not permitted for security reasons. Please upload PNG, JPEG, or WebP.' };
  }
  const isDataUri = proof.startsWith('data:image/');
  const isHttps = proof.startsWith('https://');
  if (!isDataUri && !isHttps) {
    return { valid: false, error: 'Invalid payment proof format. Must be a valid image data URI or secure HTTPS URL.' };
  }
  return { valid: true };
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: Sign in required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { studentId, classId, type, moneyAmount, grainType, grainQuantityKg, paymentProofUrl, notes } = body;

    if (!studentId || !classId || !type) {
      return NextResponse.json(
        { error: 'Missing required contribution parameters.' },
        { status: 400 }
      );
    }

    if (!['money', 'grain', 'both'].includes(type)) {
      return NextResponse.json(
        { error: `Invalid contribution type "${type}". Must be 'money', 'grain', or 'both'.` },
        { status: 400 }
      );
    }

    const isMonetary = type === 'money' || type === 'both';
    const isGrain = type === 'grain' || type === 'both';

    // Validate numeric bounds & prevent cross-type parameter tampering
    let safeMoney = 0;
    let safeProof: string | null = null;
    if (isMonetary) {
      const numMoney = Number(moneyAmount);
      if (!Number.isFinite(numMoney) || numMoney <= 0) {
        return NextResponse.json(
          { error: 'Money amount must be a positive finite number greater than 0.' },
          { status: 400 }
        );
      }
      if (numMoney > 1_000_000) {
        return NextResponse.json(
          { error: 'Money amount exceeds maximum allowed limit of ₹10,00,000.' },
          { status: 400 }
        );
      }
      safeMoney = Math.round(numMoney * 100) / 100;

      const proofCheck = validatePaymentProof(paymentProofUrl);
      if (!proofCheck.valid) {
        return NextResponse.json({ error: proofCheck.error }, { status: 400 });
      }
      safeProof = paymentProofUrl;
    }

    let safeGrainQty = 0;
    let safeGrainType: string | null = null;
    if (isGrain) {
      const numGrain = Number(grainQuantityKg);
      if (!Number.isFinite(numGrain) || numGrain <= 0) {
        return NextResponse.json(
          { error: 'Grain quantity must be a positive finite number greater than 0 KG.' },
          { status: 400 }
        );
      }
      if (numGrain > 50_000) {
        return NextResponse.json(
          { error: 'Grain quantity exceeds maximum allowed limit of 50,000 KG.' },
          { status: 400 }
        );
      }
      safeGrainQty = Math.round(numGrain * 100) / 100;
      safeGrainType = grainType ? String(grainType).trim().substring(0, 50) : null;
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
      moneyAmount: safeMoney,
      grainType: safeGrainType,
      grainQuantityKg: safeGrainQty,
      paymentProofUrl: safeProof,
      notes: notes ? String(notes).trim().substring(0, 500) : '',
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
    const { contributionId, classId, type, moneyAmount, grainType, grainQuantityKg, paymentProofUrl, notes } = body;

    if (!contributionId) {
      return NextResponse.json(
        { error: 'contributionId is required.' },
        { status: 400 }
      );
    }

    // 1. Fetch existing contribution to prevent BOLA / IDOR
    const existing = await getContribution(contributionId);
    if (!existing) {
      return NextResponse.json({ error: 'Contribution record not found.' }, { status: 404 });
    }

    // 2. Reject modifying faculty contributions via student route
    if (existing.contributorType === 'faculty' || existing.facultyId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot edit faculty records via student contribution endpoint.' },
        { status: 403 }
      );
    }

    // 3. Verify user access against the EXISTING record's classId
    if (!existing.classId || !verifyClassAccess(user, existing.classId)) {
      return NextResponse.json(
        { error: 'Forbidden: You cannot modify records for this class.' },
        { status: 403 }
      );
    }

    // 4. If classId was supplied in body, verify it matches the record's classId
    if (classId && classId !== existing.classId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot transfer a contribution to a different class.' },
        { status: 403 }
      );
    }

    const targetType = type || existing.type;
    if (!['money', 'grain', 'both'].includes(targetType)) {
      return NextResponse.json({ error: `Invalid contribution type "${targetType}".` }, { status: 400 });
    }

    const isMonetary = targetType === 'money' || targetType === 'both';
    const isGrain = targetType === 'grain' || targetType === 'both';

    let safeMoney = 0;
    let safeProof = existing.paymentProofUrl;
    if (isMonetary) {
      const numMoney = moneyAmount !== undefined ? Number(moneyAmount) : existing.moneyAmount;
      if (!Number.isFinite(numMoney) || numMoney <= 0) {
        return NextResponse.json({ error: 'Money amount must be a positive finite number greater than 0.' }, { status: 400 });
      }
      if (numMoney > 1_000_000) {
        return NextResponse.json({ error: 'Money amount exceeds maximum allowed limit of ₹10,00,000.' }, { status: 400 });
      }
      safeMoney = Math.round(numMoney * 100) / 100;

      if (paymentProofUrl !== undefined) {
        const proofCheck = validatePaymentProof(paymentProofUrl);
        if (!proofCheck.valid) {
          return NextResponse.json({ error: proofCheck.error }, { status: 400 });
        }
        safeProof = paymentProofUrl;
      } else if (!safeProof) {
        return NextResponse.json({ error: 'Payment verification screenshot is mandatory for monetary contributions.' }, { status: 400 });
      }
    } else {
      safeProof = null;
    }

    let safeGrainQty = 0;
    let safeGrainType: string | null = null;
    if (isGrain) {
      const numGrain = grainQuantityKg !== undefined ? Number(grainQuantityKg) : (existing.grainQuantityKg || 0);
      if (!Number.isFinite(numGrain) || numGrain <= 0) {
        return NextResponse.json({ error: 'Grain quantity must be a positive finite number greater than 0 KG.' }, { status: 400 });
      }
      if (numGrain > 50_000) {
        return NextResponse.json({ error: 'Grain quantity exceeds maximum allowed limit of 50,000 KG.' }, { status: 400 });
      }
      safeGrainQty = Math.round(numGrain * 100) / 100;
      safeGrainType = grainType !== undefined ? (grainType ? String(grainType).trim().substring(0, 50) : null) : existing.grainType;
    }

    const updated = await editContribution(contributionId, {
      type: targetType,
      moneyAmount: safeMoney,
      grainType: safeGrainType,
      grainQuantityKg: safeGrainQty,
      paymentProofUrl: safeProof,
      notes: notes !== undefined ? String(notes).trim().substring(0, 500) : existing.notes,
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

    if (!contributionId) {
      return NextResponse.json(
        { error: 'Contribution ID is required.' },
        { status: 400 }
      );
    }

    // 1. Fetch existing contribution first to prevent BOLA / IDOR
    const existing = await getContribution(contributionId);
    if (!existing) {
      return NextResponse.json({ error: 'Contribution record not found.' }, { status: 404 });
    }

    // 2. Reject deleting faculty contributions via student route
    if (existing.contributorType === 'faculty' || existing.facultyId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot delete faculty records via student contribution endpoint.' },
        { status: 403 }
      );
    }

    // 3. Verify user access against the EXISTING record's classId
    if (!existing.classId || !verifyClassAccess(user, existing.classId)) {
      return NextResponse.json(
        { error: 'Forbidden: You cannot delete records for this class.' },
        { status: 403 }
      );
    }

    await deleteContribution(
      contributionId,
      {
        uid: user.uid,
        email: user.email,
        name: user.name,
      },
      {
        expectedType: 'student',
        expectedClassId: existing.classId,
      }
    );

    return NextResponse.json({ success: true, message: 'Contribution deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete contribution.' },
      { status: 400 }
    );
  }
}
