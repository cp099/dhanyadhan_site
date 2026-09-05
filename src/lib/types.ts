/**
 * Institutional Role Definitions
 * - `class_admin`: Authorized Class Representative (CR) scoped strictly to their assigned class.
 * - `sdg_admin`: SDG Cell Central Administrator with full platform governance access.
 * - `faculty`: Authorized Department Faculty Member with contribution logging access.
 */
export type Role = 'class_admin' | 'sdg_admin' | 'faculty';

/**
 * User Account Profile stored in the system registry.
 */
export interface UserProfile {
  /** Unique User Identifier (Firebase Auth UID or local surrogate UID) */
  uid: string;
  /** Primary contact and authentication email */
  email: string;
  /** Display name of the user or officer */
  name: string;
  /** Access control role determining system privileges */
  role: Role;
  /** Foreign key pointing to ClassDoc.id (mandatory for class_admin, null for sdg_admin/faculty) */
  classId?: string | null;
  /** ISO 8601 timestamp of user creation */
  createdAt: string;
  /** ISO 8601 timestamp of last profile update */
  updatedAt: string;
}

/**
 * Academic Year classification for the 17 Department of Commerce cohorts.
 */
export type ClassYear = 'Year 1' | 'Year 2' | 'Year 3' | 'Masters';

/**
 * Static metadata identifying an academic class cohort.
 */
export interface ClassMetadata {
  /** Canonical slug identifier (e.g. '1-bcom-a') */
  id: string;
  /** Institutional cohort name (e.g. '1 BCom A') */
  name: string;
  /** Academic year classification */
  year: ClassYear;
  /** Specific degree program specialization */
  program: string;
}

/**
 * Persisted Class Document storing aggregate impact totals and CR assignment.
 */
export interface ClassDoc extends ClassMetadata {
  /** Cumulative monetary donations logged for this cohort in INR */
  totalMoney: number;
  /** Cumulative raw food grain weight logged for this cohort in KG */
  totalGrainKg: number;
  /** Aggregated Equivalent Impact metric in KG (money converted + grain weight) */
  totalEquivalentKg: number;
  /** Count of distinct students who contributed to this class */
  contributorCount: number;
  /** Total count of individual contribution submissions logged */
  contributionCount: number;
  /** Current position on the unified 17-class departmental leaderboard */
  currentRank?: number | null;
  /** UID of the assigned Class Representative */
  crUserId?: string | null;
  /** Email of the assigned Class Representative */
  crEmail?: string | null;
  /** Full name of the assigned Class Representative */
  crName?: string | null;
  /** ISO 8601 timestamp of last aggregation recalculation */
  updatedAt: string;
}

/**
 * Student Document representing an enrolled scholar within a specific class.
 */
export interface StudentDoc {
  /** Unique student identifier */
  id: string;
  /** Student full name */
  name: string;
  /** Institutional roll number or register number */
  rollNo?: string;
  /** Foreign key pointing to ClassDoc.id */
  classId: string;
  /** Active enrollment status */
  active: boolean;
  /** Cumulative monetary contributions logged for this student in INR */
  totalMoney: number;
  /** Cumulative food grains logged for this student in KG */
  totalGrainKg: number;
  /** Cumulative Equivalent Impact metric in KG */
  totalEquivalentKg: number;
  /** Number of individual contributions logged */
  contributionCount: number;
  /** ISO 8601 timestamp of first contribution */
  firstContributedAt?: string;
  /** ISO 8601 timestamp of student record creation */
  createdAt: string;
  /** ISO 8601 timestamp of last update */
  updatedAt: string;
}

/**
 * Faculty Member Document representing academic staff in the department.
 */
export interface FacultyDoc {
  /** Unique faculty identifier */
  id: string;
  /** Faculty member full name */
  name: string;
  /** Institutional employee code */
  employeeId?: string;
  /** Academic designation (e.g. 'Professor & Head', 'Associate Professor') */
  designation: string;
  /** Academic department name */
  department: string;
  /** Contact email address */
  email?: string;
  /** Contact phone number */
  phone?: string;
  /** Active staff status */
  active: boolean;
  /** Cumulative monetary contributions logged in INR */
  totalMoney: number;
  /** Cumulative food grains logged in KG */
  totalGrainKg: number;
  /** Cumulative Equivalent Impact metric in KG */
  totalEquivalentKg: number;
  /** Number of individual contributions logged */
  contributionCount: number;
  /** ISO 8601 timestamp of first contribution */
  firstContributedAt?: string;
  /** ISO 8601 timestamp of record creation */
  createdAt: string;
  /** ISO 8601 timestamp of last record update */
  updatedAt: string;
}

/**
 * Contribution category classification.
 */
export type ContributionType = 'money' | 'grain' | 'both';

/**
 * Grain specification defining accepted crop varieties and their impact weights.
 */
export interface AcceptedGrain {
  /** Grain identifier key (e.g. 'rice', 'wheat') */
  id: string;
  /** Public display label (e.g. 'Rice (Basmati / Sona Masoori)') */
  name: string;
  /** Weight multiplier applied when computing Equivalent KG */
  conversionFactor: number;
}

/**
 * Immutable transaction record logging an individual grain or financial gift.
 */
export interface ContributionDoc {
  /** Unique transaction UUID */
  id: string;
  /** Contributor classification */
  contributorType?: 'student' | 'faculty';
  /** Student ID if contributed by a student */
  studentId?: string;
  /** Student display name */
  studentName?: string;
  /** Faculty ID if contributed by a faculty member */
  facultyId?: string;
  /** Faculty display name */
  facultyName?: string;
  /** Associated Class ID (set for student contributions, null for faculty) */
  classId?: string | null;
  /** Donation mode: monetary, food grain, or composite */
  type: ContributionType;
  /** Financial amount in INR (>= 0) */
  moneyAmount: number;
  /** Specified grain category */
  grainType: string | null;
  /** Specified grain weight in KG (>= 0) */
  grainQuantityKg: number | null;
  /** Trusted server-computed Equivalent Impact in KG */
  equivalentKg: number;

  /** Historical campaign conversion rate schema version applied at write time */
  conversionVersion: number;
  /** Money-to-KG conversion rate snapshot locked into this transaction */
  moneyToKgRateUsed: number;
  /** Grain conversion factor snapshot locked into this transaction */
  grainConversionFactorUsed: number;

  /** User UID of the authorized officer who recorded the entry */
  recordedBy: string;
  /** Display name of the recording officer */
  recordedByName: string;
  /** Validated payment proof image (safe data URI or storage URL) */
  paymentProofUrl?: string | null;
  /** Optional transaction remarks or memo */
  notes?: string;
  /** ISO 8601 creation timestamp */
  createdAt: string;
  /** ISO 8601 modification timestamp */
  updatedAt: string;
}

/**
 * Global Campaign Configuration governed by the SDG Cell Admin.
 */
export interface CampaignConfig {
  /** Unique campaign identifier */
  campaignId: string;
  /** Institutional campaign title */
  name: string;
  /** Primary campaign motto / theme */
  tagline: string;
  /** Secondary institutional subtitle */
  secondaryTagline: string;
  /** Overarching departmental target in Equivalent KG (null if unconfigured) */
  targetKg: number | null;
  /** Monetary conversion rate (e.g. 25 indicates ₹25 = 1 Equivalent KG) */
  moneyToKgRate: number | null;
  /** List of accepted grain types and their impact factors */
  acceptedGrains: AcceptedGrain[];
  /** Campaign celebration milestone thresholds in KG */
  milestones: number[];
  /** Privacy flag: whether to expose raw departmental INR totals on the public portal */
  showTotalMoneyPublicly: boolean;
  /** Privacy flag: whether to expose raw departmental grain weights on the public portal */
  showTotalGrainKgPublicly: boolean;
  /** Campaign start timestamp */
  startDate: string | null;
  /** Campaign conclusion timestamp */
  endDate: string | null;
  /** Current campaign state */
  status: 'draft' | 'active' | 'paused' | 'completed';
  /** Official administrative communique or guidelines */
  institutionalMessaging: string;
  /** Flag indicating whether campaign parameters have been formally published */
  isConfigured: boolean;
  /** Version number incremented upon every configuration update */
  conversionVersion: number;
  /** ISO 8601 update timestamp */
  updatedAt: string;
  /** Administrator UID who performed the update */
  updatedBy: string;
}

/**
 * Public Campaign Summary model strictly sanitized for unauthenticated public delivery.
 * Excludes private student identities and financial donation sums unless permitted.
 */
export interface PublicCampaignSummary {
  name: string;
  tagline: string;
  secondaryTagline: string;
  targetKg: number | null;
  totalImpactKg: number;
  totalGrainKg?: number | null;
  totalMoney?: number | null;
  facultyTotalEquivalentKg?: number;
  contributorCount: number;
  contributionCount: number;
  progressPercentage: number;
  milestones: number[];
  status: string;
  isConfigured: boolean;
  acceptedGrains: Array<{ id: string; name: string }>;
  updatedAt: string;
}

/**
 * Public Leaderboard Entry for the 17-class unified departmental standings.
 */
export interface PublicLeaderboardItem {
  rank: number;
  classId: string;
  className: string;
  year: ClassYear;
  program: string;
  impactKg: number;
  contributorCount: number;
}

/**
 * Public Student Leaderboard Entry adhering to zero-knowledge privacy standards:
 * Exposes ONLY Rank and Name — NEVER individual money, grain, or KG numbers!
 */
export interface PublicStudentLeaderboardEntry {
  rank: number;
  name: string;
}

/**
 * Public Class Leaderboard View combining cohort totals with privacy-preserving student rankings.
 */
export interface PublicClassLeaderboard {
  classId: string;
  className: string;
  rank?: number | null;
  impactKg: number;
  contributorCount: number;
  students: PublicStudentLeaderboardEntry[];
  updatedAt: string;
}

/**
 * Immutable Audit Log Document recording sensitive administrative actions.
 */
export interface AuditLogDoc {
  id: string;
  action: string;
  adminUserId: string;
  adminUserEmail: string;
  classId?: string | null;
  studentId?: string | null;
  facultyId?: string | null;
  contributionId?: string | null;
  previousValue?: unknown;
  newValue?: unknown;
  timestamp: string;
}

