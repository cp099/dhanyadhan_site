import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, verifyFacultyAccess } from '@/lib/auth';
import {
  getFacultyContributions,
  recordFacultyContribution,
  editFacultyContribution,
  deleteContribution,
  getContribution,
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

  if (!verifyFacultyAccess(user)) {
    return NextResponse.json(
      { error: 'Forbidden: Faculty or SDG Admin authorization required.' },
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

    if (!['money', 'grain', 'both'].includes(type)) {
      return NextResponse.json(
        { error: `Invalid contribution type "${type}". Must be 'money', 'grain', or 'both'.` },
        { status: 400 }
      );
    }

    const isMonetary = type === 'money' || type === 'both';
    const isGrain = type === 'grain' || type === 'both';

    let safeMoney = 0;
    let safeProof: string | null = null;
    if (isMonetary) {
      const numMoney = Number(moneyAmount);
      if (!Number.isFinite(numMoney) || numMoney <= 0) {
        return NextResponse.json({ error: 'Money amount must be a positive finite number greater than 0.' }, { status: 400 });
      }
      if (numMoney > 1_000_000) {
        return NextResponse.json({ error: 'Money amount exceeds maximum allowed limit of ₹10,00,000.' }, { status: 400 });
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
        return NextResponse.json({ error: 'Grain quantity must be a positive finite number greater than 0 KG.' }, { status: 400 });
      }
      if (numGrain > 50_000) {
        return NextResponse.json({ error: 'Grain quantity exceeds maximum allowed limit of 50,000 KG.' }, { status: 400 });
      }
      safeGrainQty = Math.round(numGrain * 100) / 100;
      safeGrainType = grainType ? String(grainType).trim().substring(0, 50) : null;
    }

    const contribution = await recordFacultyContribution({
      facultyId,
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

    // 1. Fetch existing contribution and verify it is a faculty contribution
    const existing = await getContribution(contributionId);
    if (!existing) {
      return NextResponse.json({ error: 'Faculty contribution record not found.' }, { status: 404 });
    }

    if (existing.contributorType !== 'faculty' && !existing.facultyId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot modify student contributions via faculty endpoint.' },
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

    const updated = await editFacultyContribution(contributionId, {
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

    // 1. Fetch existing contribution and verify it is a faculty contribution
    const existing = await getContribution(contributionId);
    if (!existing) {
      return NextResponse.json({ error: 'Faculty contribution record not found.' }, { status: 404 });
    }

    if (existing.contributorType !== 'faculty' && !existing.facultyId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot delete student contributions via faculty endpoint.' },
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
        expectedType: 'faculty',
      }
    );

    return NextResponse.json({ success: true, message: 'Faculty contribution deleted.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete faculty contribution.' },
      { status: 400 }
    );
  }
}
