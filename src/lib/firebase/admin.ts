import fs from 'fs';
import path from 'path';
import {
  CampaignConfig,
  ClassDoc,
  StudentDoc,
  FacultyDoc,
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

export function getDbFilePath(): string {
  return process.env.DHANYADHAN_DB_FILE || path.join(DATA_DIR, 'local_db.json');
}

interface DatabaseSchema {
  campaign: Record<string, CampaignConfig>;
  classes: Record<string, ClassDoc>;
  students: Record<string, StudentDoc>;
  faculty: Record<string, FacultyDoc>;
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
      currentRank: null,
      crUserId: null,
      crEmail: null,
      crName: null,
      updatedAt: new Date().toISOString(),
    };
  });

  const publicLeaderboardItems: PublicLeaderboardItem[] = [];

  const publicClassLeaderboards: Record<string, PublicClassLeaderboard> = {};
  OFFICIAL_CLASSES.forEach((c) => {
    publicClassLeaderboards[c.id] = {
      classId: c.id,
      className: c.name,
      rank: null,
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

  const faculty = getInitialFacultyRoster();

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
    'faculty-coord-1': {
      uid: 'faculty-coord-1',
      email: 'faculty@dhanyadhan.edu',
      name: 'Dr. Sunita Raman (Faculty Coordinator)',
      role: 'faculty',
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
    faculty,
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

function getInitialFacultyRoster(): Record<string, FacultyDoc> {
  const now = new Date().toISOString();
  return {
    'fac-101': {
      id: 'fac-101',
      name: 'Dr. Sunita Raman',
      employeeId: 'FAC-COM-001',
      designation: 'Professor & Head of Department',
      department: 'Department of Commerce',
      email: 'faculty@dhanyadhan.edu',
      phone: '+91 98450 11223',
      active: true,
      totalMoney: 0,
      totalGrainKg: 0,
      totalEquivalentKg: 0,
      contributionCount: 0,
      createdAt: now,
      updatedAt: now,
    },
    'fac-102': {
      id: 'fac-102',
      name: 'Dr. Rajesh K. Sharma',
      employeeId: 'FAC-COM-004',
      designation: 'Associate Professor (Accounting & Finance)',
      department: 'Department of Commerce',
      email: 'r.sharma@dhanyadhan.edu',
      phone: '+91 98450 22334',
      active: true,
      totalMoney: 0,
      totalGrainKg: 0,
      totalEquivalentKg: 0,
      contributionCount: 0,
      createdAt: now,
      updatedAt: now,
    },
    'fac-103': {
      id: 'fac-103',
      name: 'Dr. Meenakshi Sundaram',
      employeeId: 'FAC-COM-008',
      designation: 'Associate Professor (Taxation & Law)',
      department: 'Department of Commerce',
      email: 'm.sundaram@dhanyadhan.edu',
      phone: '+91 98450 33445',
      active: true,
      totalMoney: 0,
      totalGrainKg: 0,
      totalEquivalentKg: 0,
      contributionCount: 0,
      createdAt: now,
      updatedAt: now,
    },
    'fac-104': {
      id: 'fac-104',
      name: 'Prof. Arvind Kulkarni',
      employeeId: 'FAC-COM-015',
      designation: 'Assistant Professor (Banking & Insurance)',
      department: 'Department of Commerce',
      email: 'a.kulkarni@dhanyadhan.edu',
      phone: '+91 98450 44556',
      active: true,
      totalMoney: 0,
      totalGrainKg: 0,
      totalEquivalentKg: 0,
      contributionCount: 0,
      createdAt: now,
      updatedAt: now,
    },
    'fac-105': {
      id: 'fac-105',
      name: 'Dr. Shalini Deshmukh',
      employeeId: 'FAC-COM-019',
      designation: 'Assistant Professor (Business Analytics)',
      department: 'Department of Commerce',
      email: 's.deshmukh@dhanyadhan.edu',
      phone: '+91 98450 55667',
      active: true,
      totalMoney: 0,
      totalGrainKg: 0,
      totalEquivalentKg: 0,
      contributionCount: 0,
      createdAt: now,
      updatedAt: now,
    },
  };
}

function getDatabase(): DatabaseSchema {
  const dbFile = getDbFilePath();
  const dir = path.dirname(dbFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(/*turbopackIgnore: true*/ dbFile)) {
    const initial = initializeEmptyDatabase();
    fs.writeFileSync(/*turbopackIgnore: true*/ dbFile, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(/*turbopackIgnore: true*/ dbFile, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    let mutated = false;

    if (!parsed.faculty) {
      parsed.faculty = getInitialFacultyRoster();
      mutated = true;
    }
    if (!parsed.users['faculty-coord-1']) {
      parsed.users['faculty-coord-1'] = {
        uid: 'faculty-coord-1',
        email: 'faculty@dhanyadhan.edu',
        name: 'Dr. Sunita Raman (Faculty Coordinator)',
        role: 'faculty',
        classId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mutated = true;
    }

    // Mathematical integrity auto-healing: verify summary matches classes + faculty
    const allClassList = Object.values(parsed.classes || {});
    const allFacultyList = Object.values(parsed.faculty || {}).filter((f) => f.active);
    const classesImpactKg = allClassList.reduce((acc, c) => acc + (c.totalEquivalentKg || 0), 0);
    const facultyImpactKg = allFacultyList.reduce((acc, f) => acc + (f.totalEquivalentKg || 0), 0);
    const expectedDeptImpact = Math.round((classesImpactKg + facultyImpactKg) * 100) / 100;
    const currentSummaryImpact = parsed.publicCampaign?.summary?.totalImpactKg || 0;

    if (Math.abs(expectedDeptImpact - currentSummaryImpact) > 0.01) {
      console.warn(`[Integrity Auto-Heal] Re-syncing aggregates: expected ${expectedDeptImpact} KG, summary had ${currentSummaryImpact} KG`);
      recalculateAllAggregates(parsed);
      mutated = true;
    }

    if (mutated) {
      saveDatabase(parsed);
    }
    return parsed;
  } catch (err) {
    console.error('Error reading database file, re-initializing:', err);
    const initial = initializeEmptyDatabase();
    fs.writeFileSync(dbFile, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

function saveDatabase(db: DatabaseSchema): void {
  const dbFile = getDbFilePath();
  const dir = path.dirname(dbFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf-8');
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
  const items = db.publicLeaderboard.allClasses?.items || [];
  return items.filter((i) => (i.impactKg || 0) > 0);
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
  const contributing = Object.values(db.classes).filter((c) => (c.totalEquivalentKg || 0) > 0);
  const nonContributing = Object.values(db.classes).filter((c) => (c.totalEquivalentKg || 0) <= 0);
  const ranked = sortClassesWithRanks(contributing);
  return [...ranked, ...nonContributing];
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

export function recalculateAllAggregates(db: DatabaseSchema): void {
  // 1. Reset student totals
  for (const s of Object.values(db.students || {})) {
    s.totalMoney = 0;
    s.totalGrainKg = 0;
    s.totalEquivalentKg = 0;
    s.contributionCount = 0;
    s.firstContributedAt = undefined;
  }

  // 2. Reset class totals
  for (const c of Object.values(db.classes || {})) {
    c.totalMoney = 0;
    c.totalGrainKg = 0;
    c.totalEquivalentKg = 0;
    c.contributorCount = 0;
    c.contributionCount = 0;
    c.currentRank = null;
  }

  // 3. Reset faculty totals
  for (const f of Object.values(db.faculty || {})) {
    f.totalMoney = 0;
    f.totalGrainKg = 0;
    f.totalEquivalentKg = 0;
    f.contributionCount = 0;
    f.firstContributedAt = undefined;
  }

  // 4. Re-apply all contributions
  for (const c of Object.values(db.contributions || {})) {
    const isFaculty = c.contributorType === 'faculty' || !!c.facultyId;
    if (isFaculty) {
      if (c.facultyId && db.faculty?.[c.facultyId]) {
        const fac = db.faculty[c.facultyId];
        fac.totalMoney = Math.round(((fac.totalMoney || 0) + (c.moneyAmount || 0)) * 100) / 100;
        fac.totalGrainKg = Math.round(((fac.totalGrainKg || 0) + (c.grainQuantityKg || 0)) * 100) / 100;
        fac.totalEquivalentKg = Math.round(((fac.totalEquivalentKg || 0) + (c.equivalentKg || 0)) * 100) / 100;
        fac.contributionCount = (fac.contributionCount || 0) + 1;
        if (!fac.firstContributedAt || new Date(c.createdAt) < new Date(fac.firstContributedAt)) {
          fac.firstContributedAt = c.createdAt;
        }
      }
    } else {
      if (c.studentId && db.students?.[c.studentId]) {
        const s = db.students[c.studentId];
        s.totalMoney = Math.round(((s.totalMoney || 0) + (c.moneyAmount || 0)) * 100) / 100;
        s.totalGrainKg = Math.round(((s.totalGrainKg || 0) + (c.grainQuantityKg || 0)) * 100) / 100;
        s.totalEquivalentKg = Math.round(((s.totalEquivalentKg || 0) + (c.equivalentKg || 0)) * 100) / 100;
        s.contributionCount = (s.contributionCount || 0) + 1;
        if (!s.firstContributedAt || new Date(c.createdAt) < new Date(s.firstContributedAt)) {
          s.firstContributedAt = c.createdAt;
        }
      }
    }
  }

  // 5. Aggregate active student totals into class totals
  for (const classObj of Object.values(db.classes || {})) {
    const students = Object.values(db.students || {}).filter((s) => s.classId === classObj.id && s.active);
    classObj.totalMoney = Math.round(students.reduce((acc, s) => acc + (s.totalMoney || 0), 0) * 100) / 100;
    classObj.totalGrainKg = Math.round(students.reduce((acc, s) => acc + (s.totalGrainKg || 0), 0) * 100) / 100;
    classObj.totalEquivalentKg = Math.round(students.reduce((acc, s) => acc + (s.totalEquivalentKg || 0), 0) * 100) / 100;
    classObj.contributorCount = students.filter((s) => (s.contributionCount || 0) > 0).length;
    classObj.contributionCount = students.reduce((acc, s) => acc + (s.contributionCount || 0), 0);
  }

  // 6. Rank classes with contributions (only classes with > 0 kg get a rank)
  const contributingClasses = Object.values(db.classes || {}).filter((c) => (c.totalEquivalentKg || 0) > 0);
  const rankedClasses = sortClassesWithRanks(contributingClasses);
  Object.values(db.classes || {}).forEach((c) => {
    const ranked = rankedClasses.find((r) => r.id === c.id);
    c.currentRank = ranked ? ranked.currentRank : null;
  });

  // 7. Update publicLeaderboard.allClasses
  db.publicLeaderboard.allClasses = {
    items: rankedClasses.map((c) => ({
      rank: c.currentRank!,
      classId: c.id,
      className: c.name,
      year: c.year,
      program: c.program,
      impactKg: c.totalEquivalentKg,
      contributorCount: c.contributorCount,
    })),
    updatedAt: new Date().toISOString(),
  };

  // 8. Update publicClassLeaderboards for all classes
  for (const c of Object.values(db.classes || {})) {
    const students = Object.values(db.students || {}).filter((s) => s.classId === c.id && s.active);
    const contributingStudents = students.filter((s) => (s.contributionCount || 0) > 0);
    const sortedStudents = sortStudentsWithRanks(contributingStudents);
    db.publicClassLeaderboards[c.id] = {
      classId: c.id,
      className: c.name,
      rank: c.currentRank || null,
      impactKg: c.totalEquivalentKg,
      contributorCount: c.contributorCount,
      students: sortedStudents.map((s) => ({
        rank: s.rank || 1,
        name: s.name,
      })),
      updatedAt: new Date().toISOString(),
    };
  }

  // 9. Update Department Aggregates & publicCampaign.summary
  updateDepartmentAggregates(db);
}

function updateCascadingAggregates(db: DatabaseSchema, _targetClassId?: string): void {
  recalculateAllAggregates(db);
}

function updateDepartmentAggregates(db: DatabaseSchema): void {
  const campaign = db.campaign.default || INITIAL_UNCONFIGURED_CAMPAIGN;
  const allClassList = Object.values(db.classes);
  const allFacultyList = Object.values(db.faculty || {}).filter((f) => f.active);

  const classesImpactKg = allClassList.reduce((acc, c) => acc + (c.totalEquivalentKg || 0), 0);
  const facultyImpactKg = allFacultyList.reduce((acc, f) => acc + (f.totalEquivalentKg || 0), 0);
  const deptImpactKg = Math.round((classesImpactKg + facultyImpactKg) * 100) / 100;

  const classesGrainKg = allClassList.reduce((acc, c) => acc + (c.totalGrainKg || 0), 0);
  const facultyGrainKg = allFacultyList.reduce((acc, f) => acc + (f.totalGrainKg || 0), 0);
  const deptGrainKg = Math.round((classesGrainKg + facultyGrainKg) * 100) / 100;

  const classesMoney = allClassList.reduce((acc, c) => acc + (c.totalMoney || 0), 0);
  const facultyMoney = allFacultyList.reduce((acc, f) => acc + (f.totalMoney || 0), 0);
  const deptMoney = Math.round((classesMoney + facultyMoney) * 100) / 100;

  const classesContributors = allClassList.reduce((acc, c) => acc + (c.contributorCount || 0), 0);
  const facultyContributors = allFacultyList.filter((f) => (f.contributionCount || 0) > 0).length;
  const deptContributors = classesContributors + facultyContributors;

  const classesContributions = allClassList.reduce((acc, c) => acc + (c.contributionCount || 0), 0);
  const facultyContributions = allFacultyList.reduce((acc, f) => acc + (f.contributionCount || 0), 0);
  const deptContributions = classesContributions + facultyContributions;

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
    facultyTotalEquivalentKg: facultyImpactKg,
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

  if (!existing.studentId || !existing.classId) {
    throw new Error('Associated student or class not found.');
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

  const isFaculty = existing.contributorType === 'faculty' || !!existing.facultyId;
  delete db.contributions[contributionId];
  recalculateAllAggregates(db);

  // Audit log
  const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  db.auditLogs[logId] = {
    id: logId,
    action: isFaculty ? 'FACULTY_CONTRIBUTION_DELETED' : 'CONTRIBUTION_DELETED',
    adminUserId: actor.uid,
    adminUserEmail: actor.email,
    classId: existing.classId || 'faculty',
    studentId: existing.studentId,
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

// ----------------- FACULTY ROSTER & CONTRIBUTIONS -----------------

export async function getAllFaculty(): Promise<FacultyDoc[]> {
  const db = getDatabase();
  return Object.values(db.faculty || {}).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getFaculty(id: string): Promise<FacultyDoc | null> {
  const db = getDatabase();
  return db.faculty?.[id] || null;
}

export async function addFaculty(params: {
  name: string;
  designation: string;
  employeeId?: string;
  department?: string;
  email?: string;
  phone?: string;
  actor: { uid: string; email: string };
}): Promise<FacultyDoc> {
  const db = getDatabase();
  const id = `fac-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newFaculty: FacultyDoc = {
    id,
    name: params.name.trim(),
    employeeId: params.employeeId?.trim() || undefined,
    designation: params.designation.trim(),
    department: params.department?.trim() || 'Department of Commerce',
    email: params.email?.trim().toLowerCase() || undefined,
    phone: params.phone?.trim() || undefined,
    active: true,
    totalMoney: 0,
    totalGrainKg: 0,
    totalEquivalentKg: 0,
    contributionCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  if (!db.faculty) db.faculty = {};
  db.faculty[id] = newFaculty;

  const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  db.auditLogs[logId] = {
    id: logId,
    action: 'FACULTY_CREATED',
    adminUserId: params.actor.uid,
    adminUserEmail: params.actor.email,
    facultyId: id,
    newValue: newFaculty,
    timestamp: now,
  };

  saveDatabase(db);
  return newFaculty;
}

export async function editFaculty(
  id: string,
  params: {
    name?: string;
    designation?: string;
    employeeId?: string;
    department?: string;
    email?: string;
    phone?: string;
    active?: boolean;
    actor: { uid: string; email: string };
  }
): Promise<FacultyDoc> {
  const db = getDatabase();
  const existing = db.faculty?.[id];
  if (!existing) {
    throw new Error('Faculty member not found.');
  }

  if (params.name !== undefined) existing.name = params.name.trim();
  if (params.designation !== undefined) existing.designation = params.designation.trim();
  if (params.employeeId !== undefined) existing.employeeId = params.employeeId?.trim() || undefined;
  if (params.department !== undefined) existing.department = params.department.trim();
  if (params.email !== undefined) existing.email = params.email?.trim().toLowerCase() || undefined;
  if (params.phone !== undefined) existing.phone = params.phone?.trim() || undefined;
  if (params.active !== undefined) existing.active = params.active;
  existing.updatedAt = new Date().toISOString();

  updateDepartmentAggregates(db);

  const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  db.auditLogs[logId] = {
    id: logId,
    action: 'FACULTY_UPDATED',
    adminUserId: params.actor.uid,
    adminUserEmail: params.actor.email,
    facultyId: id,
    newValue: existing,
    timestamp: new Date().toISOString(),
  };

  saveDatabase(db);
  return existing;
}

export async function deleteFaculty(
  id: string,
  actor: { uid: string; email: string }
): Promise<void> {
  const db = getDatabase();
  const existing = db.faculty?.[id];
  if (!existing) {
    throw new Error('Faculty member not found.');
  }

  // Soft delete / deactivate
  existing.active = false;
  existing.updatedAt = new Date().toISOString();

  updateDepartmentAggregates(db);

  const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  db.auditLogs[logId] = {
    id: logId,
    action: 'FACULTY_DEACTIVATED',
    adminUserId: actor.uid,
    adminUserEmail: actor.email,
    facultyId: id,
    newValue: existing,
    timestamp: new Date().toISOString(),
  };

  saveDatabase(db);
}

export async function recordFacultyContribution(params: {
  facultyId: string;
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

  const faculty = db.faculty?.[params.facultyId];
  if (!faculty || !faculty.active) {
    throw new Error('Selected faculty member does not exist or is inactive.');
  }

  const calc = calculateEquivalentKg(
    {
      type: params.type,
      moneyAmount: params.moneyAmount,
      grainType: params.grainType,
      grainQuantityKg: params.grainQuantityKg,
    },
    campaign
  );

  const contributionId = `contr-fac-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newContribution: ContributionDoc = {
    id: contributionId,
    contributorType: 'faculty',
    facultyId: faculty.id,
    facultyName: faculty.name,
    classId: 'faculty',
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

  faculty.totalMoney = Math.round(((faculty.totalMoney || 0) + newContribution.moneyAmount) * 100) / 100;
  faculty.totalGrainKg = Math.round(((faculty.totalGrainKg || 0) + (newContribution.grainQuantityKg || 0)) * 100) / 100;
  faculty.totalEquivalentKg = Math.round(((faculty.totalEquivalentKg || 0) + newContribution.equivalentKg) * 100) / 100;
  faculty.contributionCount = (faculty.contributionCount || 0) + 1;
  if (!faculty.firstContributedAt) {
    faculty.firstContributedAt = now;
  }
  faculty.updatedAt = now;

  updateDepartmentAggregates(db);

  const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  db.auditLogs[logId] = {
    id: logId,
    action: 'FACULTY_CONTRIBUTION_CREATED',
    adminUserId: params.actor.uid,
    adminUserEmail: params.actor.email,
    facultyId: faculty.id,
    contributionId,
    newValue: newContribution,
    timestamp: now,
  };

  saveDatabase(db);
  return newContribution;
}

export async function getFacultyContributions(): Promise<ContributionDoc[]> {
  const db = getDatabase();
  return Object.values(db.contributions)
    .filter((c) => c.contributorType === 'faculty' || c.classId === 'faculty' || !!c.facultyId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function editFacultyContribution(
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

  if (!existing || (!existing.facultyId && existing.contributorType !== 'faculty')) {
    throw new Error('Faculty contribution record not found.');
  }

  const faculty = existing.facultyId ? db.faculty?.[existing.facultyId] : null;
  if (!faculty) {
    throw new Error('Associated faculty member not found.');
  }

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

  faculty.totalMoney = Math.max(0, Math.round(((faculty.totalMoney || 0) + deltaMoney) * 100) / 100);
  faculty.totalGrainKg = Math.max(0, Math.round(((faculty.totalGrainKg || 0) + deltaGrain) * 100) / 100);
  faculty.totalEquivalentKg = Math.max(0, Math.round(((faculty.totalEquivalentKg || 0) + deltaEq) * 100) / 100);
  faculty.updatedAt = now;

  updateDepartmentAggregates(db);

  const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  db.auditLogs[logId] = {
    id: logId,
    action: 'FACULTY_CONTRIBUTION_EDITED',
    adminUserId: params.actor.uid,
    adminUserEmail: params.actor.email,
    facultyId: faculty.id,
    contributionId,
    previousValue: previousSnapshot,
    newValue: existing,
    timestamp: now,
  };

  saveDatabase(db);
  return existing;
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
  });

  if (!db.faculty || Object.keys(db.faculty).length === 0) {
    db.faculty = getInitialFacultyRoster();
  }

  recalculateAllAggregates(db);

  saveDatabase(db);
  return { success: true, message: `Seeded ${studentsCount} students for all 17 classes and department faculty roster.` };
}
