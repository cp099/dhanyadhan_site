import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, verifyClassAccess } from '@/lib/auth';
import {
  getAllClasses,
  getStudentsByClass,
  getAllStudents,
  getAllContributions,
  getContributionsByClass,
  getPublicCampaignSummary,
  getClass,
  getStudent,
  getContributionsByStudent,
} from '@/lib/firebase/admin';

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);

  // Defend against CSV Formula Injection (CWE-1236)
  const trimmed = str.trimStart();
  if (trimmed.length > 0 && ['=', '+', '-', '@', '\t', '\r'].includes(trimmed[0])) {
    str = `'${str}`;
  }

  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'department';
  const classId = searchParams.get('classId');
  const studentId = searchParams.get('studentId');

  let filename = `dhanyadhan_${type}_report_${Date.now()}.csv`;
  let csvContent = '';

  if (type === 'department') {
    // Accessible by SDG admin or CR
    const [summary, classes] = await Promise.all([
      getPublicCampaignSummary(),
      getAllClasses(),
    ]);

    const headers = [
      'Rank',
      'Class Name',
      'Program',
      'Year',
      'Equivalent Impact KG',
      'Physical Grain KG',
      'Monetary Support (INR)',
      'Unique Contributors',
      'Total Contributions',
    ];

    const rows = classes.map((c) => [
      c.currentRank ?? 'Unranked',
      c.name,
      c.program,
      c.year,
      c.totalEquivalentKg,
      c.totalGrainKg,
      c.totalMoney,
      c.contributorCount,
      c.contributionCount,
    ]);

    csvContent = [
      `"DHANYADHAN - DEPARTMENT OF COMMERCE CAMPAIGN REPORT"`,
      `"Generated At",${escapeCsv(new Date().toISOString())}`,
      `"Total Department Impact KG",${escapeCsv(summary.totalImpactKg)}`,
      `"Overall Department Target KG",${escapeCsv(summary.targetKg || 'Unconfigured')}`,
      `"Total Unique Contributors",${escapeCsv(summary.contributorCount)}`,
      `"Total Contributions Recorded",${escapeCsv(summary.contributionCount)}`,
      '',
      headers.map(escapeCsv).join(','),
      ...rows.map((r) => r.map(escapeCsv).join(',')),
    ].join('\n');
  } else if (type === 'class') {
    if (!classId) {
      return NextResponse.json({ error: 'classId is required for class report.' }, { status: 400 });
    }
    if (!verifyClassAccess(user, classId)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const [classDoc, students] = await Promise.all([
      getClass(classId),
      getStudentsByClass(classId),
    ]);

    if (!classDoc) {
      return NextResponse.json({ error: 'Class not found.' }, { status: 404 });
    }

    filename = `dhanyadhan_${classDoc.id}_student_report_${Date.now()}.csv`;

    const headers = [
      'Student Name',
      'Roll No',
      'Total Money (INR)',
      'Total Grain (KG)',
      'Total Equivalent KG',
      'Contribution Count',
      'First Contributed At',
    ];

    const rows = students.map((s) => [
      s.name,
      s.rollNo || '',
      s.totalMoney,
      s.totalGrainKg,
      s.totalEquivalentKg,
      s.contributionCount,
      s.firstContributedAt || '',
    ]);

    csvContent = [
      escapeCsv(`CLASS REPORT: ${classDoc.name} (${classDoc.year} - ${classDoc.program})`),
      `"Class Rank",${escapeCsv(classDoc.currentRank ?? 'Unranked')}`,
      `"Total Equivalent Impact KG",${escapeCsv(classDoc.totalEquivalentKg)}`,
      `"Unique Contributors",${escapeCsv(classDoc.contributorCount)}`,
      '',
      headers.map(escapeCsv).join(','),
      ...rows.map((r) => r.map(escapeCsv).join(',')),
    ].join('\n');
  } else if (type === 'contribution') {
    // Only sdg_admin or CR for their own class
    let contributions = [];
    if (classId) {
      if (!verifyClassAccess(user, classId)) {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
      }
      contributions = await getContributionsByClass(classId);
    } else {
      if (user.role !== 'sdg_admin') {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
      }
      contributions = await getAllContributions();
    }

    const headers = [
      'Transaction ID',
      'Date & Time',
      'Class',
      'Student Name',
      'Type',
      'Money Amount (INR)',
      'Grain Type',
      'Grain Quantity (KG)',
      'Official Equivalent KG',
      'Recorded By',
      'Notes',
    ];

    const rows = contributions.map((c) => [
      c.id,
      c.createdAt,
      c.classId,
      c.studentName,
      c.type,
      c.moneyAmount,
      c.grainType || '',
      c.grainQuantityKg || '',
      c.equivalentKg,
      c.recordedBy,
      c.notes || '',
    ]);

    csvContent = [
      `"DHANYADHAN - CONTRIBUTION TRANSACTIONS AUDIT REPORT"`,
      headers.map(escapeCsv).join(','),
      ...rows.map((r) => r.map(escapeCsv).join(',')),
    ].join('\n');
  } else if (type === 'student') {
    if (!studentId) {
      return NextResponse.json({ error: 'studentId required.' }, { status: 400 });
    }

    const [student, history] = await Promise.all([
      getStudent(studentId),
      getContributionsByStudent(studentId),
    ]);

    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    if (!verifyClassAccess(user, student.classId)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const safeStudentName = student.name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    filename = `dhanyadhan_student_${safeStudentName}_${Date.now()}.csv`;

    const headers = [
      'Date',
      'Type',
      'Money (INR)',
      'Grain Type',
      'Grain (KG)',
      'Equivalent KG',
      'Recorded By',
      'Notes',
    ];

    const rows = history.map((c) => [
      c.createdAt,
      c.type,
      c.moneyAmount,
      c.grainType || '',
      c.grainQuantityKg || '',
      c.equivalentKg,
      c.recordedBy,
      c.notes || '',
    ]);

    csvContent = [
      escapeCsv(`STUDENT PROFILE: ${student.name}`),
      `"Class ID",${escapeCsv(student.classId)}`,
      `"Roll No",${escapeCsv(student.rollNo || '')}`,
      `"Total Equivalent Impact KG",${escapeCsv(student.totalEquivalentKg)}`,
      `"Total Money",${escapeCsv(student.totalMoney)}`,
      `"Total Grain KG",${escapeCsv(student.totalGrainKg)}`,
      `"Contributions",${escapeCsv(student.contributionCount)}`,
      '',
      headers.map(escapeCsv).join(','),
      ...rows.map((r) => r.map(escapeCsv).join(',')),
    ].join('\n');
  }

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
