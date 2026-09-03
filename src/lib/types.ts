export type Role = 'class_admin' | 'sdg_admin';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: Role;
  classId?: string | null; // Set only for class_admin
  createdAt: string;
  updatedAt: string;
}

export type ClassYear = 'Year 1' | 'Year 2' | 'Year 3' | 'Masters';

export interface ClassMetadata {
  id: string; // e.g. '1-bcom-a'
  name: string; // e.g. '1 BCom A'
  year: ClassYear;
  program: string; // 'BCom Regular', 'BCom AFA', 'BCom A&T', 'BCom F&I', 'M.Com'
}

export interface ClassDoc extends ClassMetadata {
  totalMoney: number;
  totalGrainKg: number;
  totalEquivalentKg: number;
  contributorCount: number; // Unique students who contributed
  contributionCount: number; // Total contribution submissions
  currentRank: number;
  crUserId?: string | null;
  crEmail?: string | null;
  crName?: string | null;
  updatedAt: string;
}

export interface StudentDoc {
  id: string;
  name: string;
  rollNo?: string;
  classId: string;
  active: boolean;
  totalMoney: number;
  totalGrainKg: number;
  totalEquivalentKg: number;
  contributionCount: number;
  firstContributedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContributionType = 'money' | 'grain' | 'both';

export interface AcceptedGrain {
  id: string;
  name: string;
  conversionFactor: number; // multiplier to KG equivalent
}

export interface ContributionDoc {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  type: ContributionType;
  moneyAmount: number;
  grainType: string | null;
  grainQuantityKg: number | null;
  equivalentKg: number;
  
  // Historical conversion integrity:
  conversionVersion: number;
  moneyToKgRateUsed: number;
  grainConversionFactorUsed: number;
  
  recordedBy: string; // User ID / Email
  recordedByName: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignConfig {
  campaignId: string;
  name: string;
  tagline: string;
  secondaryTagline: string;
  targetKg: number | null; // Unconfigured by default
  moneyToKgRate: number | null; // Unconfigured by default (e.g., ₹25 = 1 KG)
  acceptedGrains: AcceptedGrain[];
  milestones: number[];
  showTotalMoneyPublicly: boolean;
  showTotalGrainKgPublicly: boolean;
  startDate: string | null;
  endDate: string | null;
  status: 'draft' | 'active' | 'paused' | 'completed';
  institutionalMessaging: string;
  isConfigured: boolean; // Flag to indicate if SDG Cell finalized values
  conversionVersion: number;
  updatedAt: string;
  updatedBy: string;
}

// PUBLIC READ-ONLY MODELS (strictly sanitized)
export interface PublicCampaignSummary {
  name: string;
  tagline: string;
  secondaryTagline: string;
  targetKg: number | null;
  totalImpactKg: number;
  totalGrainKg?: number | null; // exposed only if showTotalGrainKgPublicly
  totalMoney?: number | null; // exposed only if showTotalMoneyPublicly
  contributorCount: number;
  contributionCount: number;
  progressPercentage: number;
  milestones: number[];
  status: string;
  isConfigured: boolean;
  acceptedGrains: Array<{ id: string; name: string }>;
  updatedAt: string;
}

export interface PublicLeaderboardItem {
  rank: number;
  classId: string;
  className: string;
  year: ClassYear;
  program: string;
  impactKg: number;
  contributorCount: number;
}

export interface PublicStudentLeaderboardEntry {
  rank: number;
  name: string;
  // NO monetary, grain, or equivalent KG metrics!
}

export interface PublicClassLeaderboard {
  classId: string;
  className: string;
  rank: number;
  impactKg: number;
  contributorCount: number;
  students: PublicStudentLeaderboardEntry[];
  updatedAt: string;
}

export interface AuditLogDoc {
  id: string;
  action: string; // e.g. 'CONTRIBUTION_CREATED', 'CONTRIBUTION_DELETED', 'CAMPAIGN_UPDATED'
  adminUserId: string;
  adminUserEmail: string;
  classId?: string | null;
  studentId?: string | null;
  contributionId?: string | null;
  previousValue?: unknown;
  newValue?: unknown;
  timestamp: string;
}
