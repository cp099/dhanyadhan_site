import fs from 'fs';
import path from 'path';
import {
  CampaignConfig,
  ClassDoc,
  StudentDoc,
  ContributionDoc,
  PublicCampaignSummary,
  PublicLeaderboardItem,
  PublicClassLeaderboard,
  UserProfile,
  AuditLogDoc,
  ContributionType,
} from '../types';
import { OFFICIAL_CLASSES, INITIAL_UNCONFIGURED_CAMPAIGN, DEMO_PRESET_CAMPAIGN } from '../constants';
import { calculateEquivalentKg, sortClassesWithRanks, sortStudentsWithRanks } from '../calculations';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'local_db.json');

interface DatabaseSchema {
  campaign: Record<string, CampaignConfig>;
  classes: Record<string, ClassDoc>;
  students: Record<string, StudentDoc>;
  contributions: Record<string, ContributionDoc>;
  publicCampaign: Record<string, PublicCampaignSummary>;
  publicLeaderboard: Record<string, { items: PublicLeaderboardItem[]; updatedAt: string }>;
  publicClassLeaderboards: Record<string, PublicClassLeaderboard>;
  users: Record<string, UserProfile>;
  auditLogs: Record<string, AuditLogDoc>;
}

function initializeEmptyDatabase(): DatabaseSchema {
  const classes: Record<string, ClassDoc> = {};
  OFFICIAL_CLASSES.forEach((c) => {
    classes[c.id] = {
      ...c,
      totalMoney: 0,
      totalGrainKg: 0,
      totalEquivalentKg: 0,
      contributorCount: 0,
      contributionCount: 0,
      currentRank: 1,
      crUserId: null,
      crEmail: null,
      crName: null,
      updatedAt: new Date().toISOString(),
    };
  });

  const publicLeaderboardItems: PublicLeaderboardItem[] = OFFICIAL_CLASSES.map((c, index) => ({
    rank: index + 1,
    classId: c.id,
    className: c.name,
    year: c.year,
    program: c.program,
    impactKg: 0,
    contributorCount: 0,
  }));

  const publicClassLeaderboards: Record<string, PublicClassLeaderboard> = {};
  OFFICIAL_CLASSES.forEach((c, index) => {
    publicClassLeaderboards[c.id] = {
      classId: c.id,
      className: c.name,
      rank: index + 1,
      impactKg: 0,
      contributorCount: 0,
      students: [],
      updatedAt: new Date().toISOString(),
    };
  });

  const publicCampaign: PublicCampaignSummary = {
    name: INITIAL_UNCONFIGURED_CAMPAIGN.name,
    tagline: INITIAL_UNCONFIGURED_CAMPAIGN.tagline,
    secondaryTagline: INITIAL_UNCONFIGURED_CAMPAIGN.secondaryTagline,
    targetKg: null,
    totalImpactKg: 0,
    totalGrainKg: null,
    totalMoney: null,
    contributorCount: 0,
    contributionCount: 0,
    progressPercentage: 0,
    milestones: [],
    status: 'draft',
    isConfigured: false,
    acceptedGrains: [],
    updatedAt: new Date().toISOString(),
  };

  // Pre-seed default administrative accounts for development/testing
  const users: Record<string, UserProfile> = {
    'sdg-admin-1': {
      uid: 'sdg-admin-1',
      email: 'sdgadmin@dhanyadhan.edu',
      name: 'SDG Cell Director',
      role: 'sdg_admin',
      classId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'cr-2-bcom-afa': {
      uid: 'cr-2-bcom-afa',
      email: 'cr.2bcom.afa@dhanyadhan.edu',
      name: 'Priya Sharma (CR)',
      role: 'class_admin',
      classId: '2-bcom-afa',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'cr-1-bcom-a': {
      uid: 'cr-1-bcom-a',
      email: 'cr.1bcom.a@dhanyadhan.edu',
      name: 'Arjun Verma (CR)',
      role: 'class_admin',
      classId: '1-bcom-a',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  // Assign CR to class
  classes['2-bcom-afa'].crUserId = 'cr-2-bcom-afa';
  classes['2-bcom-afa'].crEmail = 'cr.2bcom.afa@dhanyadhan.edu';
  classes['2-bcom-afa'].crName = 'Priya Sharma (CR)';

  classes['1-bcom-a'].crUserId = 'cr-1-bcom-a';
  classes['1-bcom-a'].crEmail = 'cr.1bcom.a@dhanyadhan.edu';
  classes['1-bcom-a'].crName = 'Arjun Verma (CR)';

  return {
    campaign: {
      default: INITIAL_UNCONFIGURED_CAMPAIGN,
    },
    classes,
    students: {},
    contributions: {},
    publicCampaign: {
      summary: publicCampaign,
    },
    publicLeaderboard: {
      allClasses: {
        items: publicLeaderboardItems,
        updatedAt: new Date().toISOString(),
      },
    },
    publicClassLeaderboards,
    users,
    auditLogs: {},
  };
}

function getDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initial = initializeEmptyDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error('Error reading database file, re-initializing:', err);
    const initial = initializeEmptyDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

function saveDatabase(db: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// ----------------- Public Queries -----------------

export async function getCampaignConfig(): Promise<CampaignConfig> {
  const db = getDatabase();
  return db.campaign.default || INITIAL_UNCONFIGURED_CAMPAIGN;
}

export async function saveCampaignConfig(
  config: Partial<CampaignConfig>,
  actor: { uid: string; email: string }
): Promise<CampaignConfig> {
  const db = getDatabase();
  const current = db.campaign.default || INITIAL_UNCONFIGURED_CAMPAIGN;
  const isNowConfigured =
    config.targetKg !== undefined &&
    config.targetKg !== null &&
    config.targetKg > 0 &&
    config.moneyToKgRate !== undefined &&
    config.moneyToKgRate !== null &&
    config.moneyToKgRate > 0 &&
    Array.isArray(config.acceptedGrains) &&
    config.acceptedGrains.length > 0;

  const updated: CampaignConfig = {
    ...current,
    ...config,
    isConfigured: config.isConfigured !== undefined ? config.isConfigured : isNowConfigured,
    conversionVersion:
      config.moneyToKgRate !== current.moneyToKgRate ||
      JSON.stringify(config.acceptedGrains) !== JSON.stringify(current.acceptedGrains)
        ? (current.conversionVersion || 1) + 1
        : current.conversionVersion || 1,
    updatedAt: new Date().toISOString(),
    updatedBy: actor.email,
  };

  db.campaign.default = updated;

  // Refresh public summary
  const summary = db.publicCampaign.summary || {
    name: updated.name,
    tagline: updated.tagline,
    secondaryTagline: updated.secondaryTagline,
    targetKg: updated.targetKg,
    totalImpactKg: 0,
    contributorCount: 0,
    contributionCount: 0,
    progressPercentage: 0,
    milestones: updated.milestones || [],
    status: updated.status,
    isConfigured: updated.isConfigured,
    acceptedGrains: updated.acceptedGrains.map((g) => ({ id: g.id, name: g.name })),
    updatedAt: new Date().toISOString(),
  };

  summary.name = updated.name;
  summary.tagline = updated.tagline;
  summary.secondaryTagline = updated.secondaryTagline;
  summary.targetKg = updated.targetKg;
  summary.milestones = updated.milestones;
  summary.status = updated.status;
  summary.isConfigured = updated.isConfigured;
  summary.acceptedGrains = updated.acceptedGrains.map((g) => ({ id: g.id, name: g.name }));
  if (updated.showTotalMoneyPublicly) {
    summary.totalMoney = Object.values(db.classes).reduce((acc, c) => acc + (c.totalMoney || 0), 0);
  } else {
    delete summary.totalMoney;
  }
  if (updated.showTotalGrainKgPublicly) {
    summary.totalGrainKg = Object.values(db.classes).reduce((acc, c) => acc + (c.totalGrainKg || 0), 0);
  } else {
    delete summary.totalGrainKg;
  }
  if (updated.targetKg && updated.targetKg > 0) {
    summary.progressPercentage = Math.min(
      100,
      Math.round((summary.totalImpactKg / updated.targetKg) * 1000) / 10
    );
  } else {
    summary.progressPercentage = 0;
  }
  summary.updatedAt = new Date().toISOString();
  db.publicCampaign.summary = summary;

  // Audit log
  const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  db.auditLogs[logId] = {
    id: logId,
    action: 'CAMPAIGN_CONFIG_UPDATED',
    adminUserId: actor.uid,
    adminUserEmail: actor.email,
    previousValue: current,
    newValue: updated,
    timestamp: new Date().toISOString(),
  };

  saveDatabase(db);
  return updated;
}

export async function getPublicCampaignSummary(): Promise<PublicCampaignSummary> {
  const db = getDatabase();
  return (
    db.publicCampaign.summary || {
      name: INITIAL_UNCONFIGURED_CAMPAIGN.name,
      tagline: INITIAL_UNCONFIGURED_CAMPAIGN.tagline,
      secondaryTagline: INITIAL_UNCONFIGURED_CAMPAIGN.secondaryTagline,
      targetKg: null,
      totalImpactKg: 0,
      contributorCount: 0,
      contributionCount: 0,
      progressPercentage: 0,
      milestones: [],
      status: 'draft',
      isConfigured: false,
      acceptedGrains: [],
      updatedAt: new Date().toISOString(),
    }
  );
}

export async function getPublicLeaderboard(): Promise<PublicLeaderboardItem[]> {
  const db = getDatabase();
  return db.publicLeaderboard.allClasses?.items || [];
}

export async function getPublicClassLeaderboard(
  classId: string
): Promise<PublicClassLeaderboard | null> {
  const db = getDatabase();
  return db.publicClassLeaderboards[classId] || null;
}

// ----------------- Administrative Queries -----------------

export async function getAllClasses(): Promise<ClassDoc[]> {
  const db = getDatabase();
  return sortClassesWithRanks(Object.values(db.classes));
}

export async function getClass(classId: string): Promise<ClassDoc | null> {
  const db = getDatabase();
  return db.classes[classId] || null;
}

export async function getStudentsByClass(classId: string): Promise<StudentDoc[]> {
  const db = getDatabase();
  return Object.values(db.students).filter((s) => s.classId === classId && s.active);
}

export async function getAllStudents(): Promise<StudentDoc[]> {
  const db = getDatabase();
  return Object.values(db.students).filter((s) => s.active);
}

export async function getStudent(studentId: string): Promise<StudentDoc | null> {
  const db = getDatabase();
  return db.students[studentId] || null;
}

export async function getContributionsByClass(classId: string): Promise<ContributionDoc[]> {
  const db = getDatabase();
  return Object.values(db.contributions)
    .filter((c) => c.classId === classId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getContributionsByStudent(studentId: string): Promise<ContributionDoc[]> {
  const db = getDatabase();
  return Object.values(db.contributions)
    .filter((c) => c.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAllContributions(): Promise<ContributionDoc[]> {
  const db = getDatabase();
  return Object.values(db.contributions).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ----------------- ATOMIC AGGREGATION ENGINE -----------------

function updateCascadingAggregates(db: DatabaseSchema, targetClassId: string): void {
  // 1. Recalculate Class totals from active students
  const classStudents = Object.values(db.students).filter(
    (s) => s.classId === targetClassId && s.active
  );
  const classObj = db.classes[targetClassId];
  if (!classObj) return;

  const totalMoney = classStudents.reduce((acc, s) => acc + (s.totalMoney || 0), 0);
  const totalGrainKg = classStudents.reduce((acc, s) => acc + (s.totalGrainKg || 0), 0);
  const totalEquivalentKg = classStudents.reduce(
    (acc, s) => acc + (s.totalEquivalentKg || 0),
    0
  );
  const contributorCount = classStudents.filter((s) => (s.contributionCount || 0) > 0).length;
  const contributionCount = classStudents.reduce(
    (acc, s) => acc + (s.contributionCount || 0),
    0
  );

  classObj.totalMoney = Math.round(totalMoney * 100) / 100;
  classObj.totalGrainKg = Math.round(totalGrainKg * 100) / 100;
  classObj.totalEquivalentKg = Math.round(totalEquivalentKg * 100) / 100;
  classObj.contributorCount = contributorCount;
  classObj.contributionCount = contributionCount;
  classObj.updatedAt = new Date().toISOString();

  // 2. Recalculate Ranks across all 17 classes deterministically
  const rankedClasses = sortClassesWithRanks(Object.values(db.classes));
  rankedClasses.forEach((c) => {
    db.classes[c.id].currentRank = c.currentRank;
  });

  // 3. Update publicLeaderboard/allClasses
  db.publicLeaderboard.allClasses = {
    items: rankedClasses.map((c) => ({
      rank: c.currentRank,
      classId: c.id,
      className: c.name,
      year: c.year,
      program: c.program,
      impactKg: c.totalEquivalentKg,
      contributorCount: c.contributorCount,
    })),
    updatedAt: new Date().toISOString(),
  };

  // 4. Update publicClassLeaderboards/{classId}
  // CRITICAL PRIVACY RULE: Show NAMES AND RANKS ONLY!
  const sortedStudents = sortStudentsWithRanks(
    classStudents.filter((s) => s.contributionCount > 0)
  );

  db.publicClassLeaderboards[targetClassId] = {
    classId: targetClassId,
    className: classObj.name,
    rank: classObj.currentRank,
    impactKg: classObj.totalEquivalentKg,
    contributorCount: classObj.contributorCount,
    students: sortedStudents.map((s) => ({
      rank: s.rank,
      name: s.name,
    })),
    updatedAt: new Date().toISOString(),
  };

  // 5. Update Department Aggregate & publicCampaign/summary
  const campaign = db.campaign.default || INITIAL_UNCONFIGURED_CAMPAIGN;
  const allClassList = Object.values(db.classes);
  const deptImpactKg = Math.round(
    allClassList.reduce((acc, c) => acc + (c.totalEquivalentKg || 0), 0) * 100
  ) / 100;
  const deptGrainKg = Math.round(
    allClassList.reduce((acc, c) => acc + (c.totalGrainKg || 0), 0) * 100
  ) / 100;
  const deptMoney = Math.round(
    allClassList.reduce((acc, c) => acc + (c.totalMoney || 0), 0) * 100
  ) / 100;
  const deptContributors = allClassList.reduce((acc, c) => acc + (c.contributorCount || 0), 0);
  const deptContributions = allClassList.reduce((acc, c) => acc + (c.contributionCount || 0), 0);

  const progressPercentage =
    campaign.targetKg && campaign.targetKg > 0
      ? Math.min(100, Math.round((deptImpactKg / campaign.targetKg) * 1000) / 10)
      : 0;

  db.publicCampaign.summary = {
    name: campaign.name,
    tagline: campaign.tagline,
    secondaryTagline: campaign.secondaryTagline,
    targetKg: campaign.targetKg,
    totalImpactKg: deptImpactKg,
    totalGrainKg: campaign.showTotalGrainKgPublicly ? deptGrainKg : null,
    totalMoney: campaign.showTotalMoneyPublicly ? deptMoney : null,
    contributorCount: deptContributors,
    contributionCount: deptContributions,
    progressPercentage,
    milestones: campaign.milestones || [],
    status: campaign.status,
    isConfigured: campaign.isConfigured,
    acceptedGrains: campaign.acceptedGrains.map((g) => ({ id: g.id, name: g.name })),
    updatedAt: new Date().toISOString(),
  };
}

export async function recordContribution(params: {
  studentId: string;
  classId: string;
  type: ContributionType;
  moneyAmount?: number;
  grainType?: string | null;
  grainQuantityKg?: number | null;
  paymentProofUrl?: string | null;
  notes?: string;
  actor: { uid: string; email: string; name: string };
}): Promise<ContributionDoc> {
  const db = getDatabase();
  const campaign = db.campaign.default || INITIAL_UNCONFIGURED_CAMPAIGN;

  // 1. Verify student
  const student = db.students[params.studentId];
  if (!student || !student.active) {
    throw new Error('Selected student does not exist or is inactive.');
  }
  if (student.classId !== params.classId) {
    throw new Error('Student does not belong to the selected class.');
  }

  // 2. Calculate official equivalent KG using server rules
  const calc = calculateEquivalentKg(
    {
      type: params.type,
      moneyAmount: params.moneyAmount,
      grainType: params.grainType,
      grainQuantityKg: params.grainQuantityKg,
    },
    campaign
  );

  const contributionId = `contr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newContribution: ContributionDoc = {
    id: contributionId,
    studentId: student.id,
    studentName: student.name,
    classId: params.classId,
    type: params.type,
    moneyAmount: params.moneyAmount || 0,
    grainType: params.grainType || null,
    grainQuantityKg: params.grainQuantityKg || 0,
    equivalentKg: calc.equivalentKg,
    conversionVersion: calc.conversionVersion,
    moneyToKgRateUsed: calc.moneyToKgRateUsed,
    grainConversionFactorUsed: calc.grainConversionFactorUsed,
    recordedBy: params.actor.email,
    recordedByName: params.actor.name,
    paymentProofUrl: params.paymentProofUrl || null,
    notes: params.notes || '',
    createdAt: now,
    updatedAt: now,
  };

  db.contributions[contributionId] = newContribution;

  // Update student totals
  student.totalMoney = Math.round(((student.totalMoney || 0) + newContribution.moneyAmount) * 100) / 100;
  student.totalGrainKg = Math.round(((student.totalGrainKg || 0) + (newContribution.grainQuantityKg || 0)) * 100) / 100;
  student.totalEquivalentKg = Math.round(((student.totalEquivalentKg || 0) + newContribution.equivalentKg) * 100) / 100;
  student.contributionCount = (student.contributionCount || 0) + 1;
  if (!student.firstContributedAt) {
    student.firstContributedAt = now;
  }
  student.updatedAt = now;

  // Update cascading aggregates
  updateCascadingAggregates(db, params.classId);

  // Audit log
  const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  db.auditLogs[logId] = {
    id: logId,
    action: 'CONTRIBUTION_CREATED',
    adminUserId: params.actor.uid,
    adminUserEmail: params.actor.email,
    classId: params.classId,
    studentId: student.id,
    contributionId,
    newValue: newContribution,
    timestamp: now,
  };

  saveDatabase(db);
  return newContribution;
}

export async function editContribution(
  contributionId: string,
  params: {
    type: ContributionType;
    moneyAmount?: number;
    grainType?: string | null;
    grainQuantityKg?: number | null;
    paymentProofUrl?: string | null;
    notes?: string;
    actor: { uid: string; email: string; name: string };
  }
): Promise<ContributionDoc> {
  const db = getDatabase();
  const campaign = db.campaign.default || INITIAL_UNCONFIGURED_CAMPAIGN;
  const existing = db.contributions[contributionId];

  if (!existing) {
    throw new Error('Contribution record not found.');
  }

  const student = db.students[existing.studentId];
  if (!student) {
    throw new Error('Associated student not found.');
  }

  // Recalculate using server logic
  const calc = calculateEquivalentKg(
    {
      type: params.type,
      moneyAmount: params.moneyAmount,
      grainType: params.grainType,
      grainQuantityKg: params.grainQuantityKg,
    },
    campaign
  );

  const deltaMoney = (params.moneyAmount || 0) - existing.moneyAmount;
  const deltaGrain = (params.grainQuantityKg || 0) - (existing.grainQuantityKg || 0);
  const deltaEq = calc.equivalentKg - existing.equivalentKg;

  const previousSnapshot = { ...existing };
  const now = new Date().toISOString();

  existing.type = params.type;
  existing.moneyAmount = params.moneyAmount || 0;
  existing.grainType = params.grainType || null;
  existing.grainQuantityKg = params.grainQuantityKg || 0;
  existing.equivalentKg = calc.equivalentKg;
  existing.conversionVersion = calc.conversionVersion;
  existing.moneyToKgRateUsed = calc.moneyToKgRateUsed;
  existing.grainConversionFactorUsed = calc.grainConversionFactorUsed;
  if (params.paymentProofUrl !== undefined) existing.paymentProofUrl = params.paymentProofUrl;
  if (params.notes !== undefined) existing.notes = params.notes;
  existing.updatedAt = now;

  // Apply deltas to student
  student.totalMoney = Math.round(((student.totalMoney || 0) + deltaMoney) * 100) / 100;
  student.totalGrainKg = Math.round(((student.totalGrainKg || 0) + deltaGrain) * 100) / 100;
  student.totalEquivalentKg = Math.round(((student.totalEquivalentKg || 0) + deltaEq) * 100) / 100;
  student.updatedAt = now;

  // Update cascading aggregates
  updateCascadingAggregates(db, existing.classId);

  // Audit log
  const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  db.auditLogs[logId] = {
    id: logId,
    action: 'CONTRIBUTION_EDITED',
    adminUserId: params.actor.uid,
    adminUserEmail: params.actor.email,
    classId: existing.classId,
    studentId: student.id,
    contributionId,
    previousValue: previousSnapshot,
    newValue: existing,
    timestamp: now,
  };

  saveDatabase(db);
  return existing;
}

export async function deleteContribution(
  contributionId: string,
  actor: { uid: string; email: string; name: string }
): Promise<void> {
  const db = getDatabase();
  const existing = db.contributions[contributionId];

  if (!existing) {
    throw new Error('Contribution record not found.');
  }

  const student = db.students[existing.studentId];
  const classId = existing.classId;

  if (student) {
    student.totalMoney = Math.max(0, Math.round(((student.totalMoney || 0) - existing.moneyAmount) * 100) / 100);
    student.totalGrainKg = Math.max(0, Math.round(((student.totalGrainKg || 0) - (existing.grainQuantityKg || 0)) * 100) / 100);
    student.totalEquivalentKg = Math.max(0, Math.round(((student.totalEquivalentKg || 0) - existing.equivalentKg) * 100) / 100);
    student.contributionCount = Math.max(0, (student.contributionCount || 0) - 1);
    if (student.contributionCount === 0) {
      student.firstContributedAt = undefined;
    }
    student.updatedAt = new Date().toISOString();
  }

  delete db.contributions[contributionId];

  // Update cascading aggregates
  updateCascadingAggregates(db, classId);

  // Audit log
  const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  db.auditLogs[logId] = {
    id: logId,
    action: 'CONTRIBUTION_DELETED',
    adminUserId: actor.uid,
    adminUserEmail: actor.email,
    classId,
    studentId: student?.id,
    contributionId,
    previousValue: existing,
    timestamp: new Date().toISOString(),
  };

  saveDatabase(db);
}

// ----------------- STUDENT ROSTER & CSV IMPORT -----------------

export async function addStudent(params: {
  name: string;
  classId: string;
  rollNo?: string;
  actor: { uid: string; email: string };
}): Promise<StudentDoc> {
  const db = getDatabase();
  if (!OFFICIAL_CLASSES.some((c) => c.id === params.classId)) {
    throw new Error(`Invalid classId: ${params.classId}`);
  }

  const studentId = `std-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newStudent: StudentDoc = {
    id: studentId,
    name: params.name.trim(),
    rollNo: params.rollNo?.trim(),
    classId: params.classId,
    active: true,
    totalMoney: 0,
    totalGrainKg: 0,
    totalEquivalentKg: 0,
    contributionCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  db.students[studentId] = newStudent;

  const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  db.auditLogs[logId] = {
    id: logId,
    action: 'STUDENT_CREATED',
    adminUserId: params.actor.uid,
    adminUserEmail: params.actor.email,
    classId: params.classId,
    studentId,
    newValue: newStudent,
    timestamp: now,
  };

  saveDatabase(db);
  return newStudent;
}

export async function importStudentsBatch(
  students: Array<{ name: string; classId: string; rollNo?: string }>,
  actor: { uid: string; email: string }
): Promise<{ importedCount: number; errors: string[] }> {
  const db = getDatabase();
  const errors: string[] = [];
  let importedCount = 0;

  const validClassIds = new Set(OFFICIAL_CLASSES.map((c) => c.id));
  const classNameToIdMap: Record<string, string> = {};
  OFFICIAL_CLASSES.forEach((c) => {
    classNameToIdMap[c.name.toLowerCase()] = c.id;
    classNameToIdMap[c.id.toLowerCase()] = c.id;
  });

  students.forEach((row, index) => {
    const rawClass = (row.classId || '').trim().toLowerCase();
    const resolvedClassId = classNameToIdMap[rawClass];

    if (!resolvedClassId || !validClassIds.has(resolvedClassId)) {
      errors.push(`Row ${index + 1}: Unrecognized class "${row.classId}". Must match one of the 17 Commerce classes.`);
      return;
    }

    if (!row.name || !row.name.trim()) {
      errors.push(`Row ${index + 1}: Student Name cannot be empty.`);
      return;
    }

    const studentId = `std-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    db.students[studentId] = {
      id: studentId,
      name: row.name.trim(),
      rollNo: row.rollNo?.trim(),
      classId: resolvedClassId,
      active: true,
      totalMoney: 0,
      totalGrainKg: 0,
      totalEquivalentKg: 0,
      contributionCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    importedCount++;
  });

  if (importedCount > 0) {
    const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    db.auditLogs[logId] = {
      id: logId,
      action: 'STUDENTS_BATCH_IMPORTED',
      adminUserId: actor.uid,
      adminUserEmail: actor.email,
      newValue: { importedCount, errorCount: errors.length },
      timestamp: new Date().toISOString(),
    };
    saveDatabase(db);
  }

  return { importedCount, errors };
}

// ----------------- USER & CR MANAGEMENT -----------------

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getDatabase();
  return db.users[uid] || null;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const db = getDatabase();
  db.users[profile.uid] = profile;

  // If this user is a class_admin, update the class record
  if (profile.role === 'class_admin' && profile.classId && db.classes[profile.classId]) {
    db.classes[profile.classId].crUserId = profile.uid;
    db.classes[profile.classId].crEmail = profile.email;
    db.classes[profile.classId].crName = profile.name;
  }

  saveDatabase(db);
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const db = getDatabase();
  return Object.values(db.users);
}

export async function getAuditLogs(): Promise<AuditLogDoc[]> {
  const db = getDatabase();
  return Object.values(db.auditLogs).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// ----------------- SEED UTILITY FOR DEV / TESTING -----------------

export async function seedDevelopmentData(options?: {
  applyDemoCampaignConfig?: boolean;
  sampleStudentsPerClass?: number;
}): Promise<{ success: boolean; message: string }> {
  const db = getDatabase();

  if (options?.applyDemoCampaignConfig) {
    db.campaign.default = {
      ...INITIAL_UNCONFIGURED_CAMPAIGN,
      ...DEMO_PRESET_CAMPAIGN,
      updatedAt: new Date().toISOString(),
      updatedBy: 'seed-system',
    } as CampaignConfig;
  }

  const studentsCount = options?.sampleStudentsPerClass || 5;
  const sampleNames = [
    'Rahul Sharma', 'Ananya Iyer', 'Arjun Verma', 'Priya Patel', 'Rohan Nair',
    'Sneha Kulkarni', 'Aditya Singh', 'Kavya Reddy', 'Vikram Joshi', 'Meera Rao',
    'Karan Mehta', 'Divya Sundaram', 'Siddharth Menon', 'Pooja Agarwal', 'Nikhil Gupta',
    'Tanvi Deshmukh', 'Varun Pillai', 'Rhea Sen', 'Manish Kapoor', 'Ishaan Bhatt'
  ];

  OFFICIAL_CLASSES.forEach((c) => {
    for (let i = 0; i < studentsCount; i++) {
      const name = `${sampleNames[(i + OFFICIAL_CLASSES.indexOf(c) * 3) % sampleNames.length]} (${c.name})`;
      const studentId = `std-seed-${c.id}-${i + 1}`;
      db.students[studentId] = {
        id: studentId,
        name,
        rollNo: `COMM-${c.id.toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
        classId: c.id,
        active: true,
        totalMoney: 0,
        totalGrainKg: 0,
        totalEquivalentKg: 0,
        contributionCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    updateCascadingAggregates(db, c.id);
  });

  saveDatabase(db);
  return { success: true, message: `Seeded ${studentsCount} students for all 17 classes.` };
}
