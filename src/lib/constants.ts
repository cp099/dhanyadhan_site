import { ClassMetadata, CampaignConfig } from './types';

export const OFFICIAL_CLASSES: ClassMetadata[] = [
  // Year 1
  { id: '1-bcom-a', name: '1 BCom A', year: 'Year 1', program: 'BCom Regular' },
  { id: '1-bcom-b', name: '1 BCom B', year: 'Year 1', program: 'BCom Regular' },
  { id: '1-bcom-afa', name: '1 BCom AFA', year: 'Year 1', program: 'BCom AFA' },
  { id: '1-bcom-at', name: '1 BCom A&T', year: 'Year 1', program: 'BCom A&T' },
  { id: '1-bcom-fi', name: '1 BCom F&I', year: 'Year 1', program: 'BCom F&I' },

  // Year 2
  { id: '2-bcom-a', name: '2 BCom A', year: 'Year 2', program: 'BCom Regular' },
  { id: '2-bcom-b', name: '2 BCom B', year: 'Year 2', program: 'BCom Regular' },
  { id: '2-bcom-afa', name: '2 BCom AFA', year: 'Year 2', program: 'BCom AFA' },
  { id: '2-bcom-at', name: '2 BCom A&T', year: 'Year 2', program: 'BCom A&T' },
  { id: '2-bcom-fi', name: '2 BCom F&I', year: 'Year 2', program: 'BCom F&I' },

  // Year 3
  { id: '3-bcom-a', name: '3 BCom A', year: 'Year 3', program: 'BCom Regular' },
  { id: '3-bcom-b', name: '3 BCom B', year: 'Year 3', program: 'BCom Regular' },
  { id: '3-bcom-afa', name: '3 BCom AFA', year: 'Year 3', program: 'BCom AFA' },
  { id: '3-bcom-at', name: '3 BCom A&T', year: 'Year 3', program: 'BCom A&T' },
  { id: '3-bcom-fi', name: '3 BCom F&I', year: 'Year 3', program: 'BCom F&I' },

  // Masters
  { id: 'mcom-1', name: 'M.Com 1', year: 'Masters', program: 'M.Com' },
  { id: 'mcom-2', name: 'M.Com 2', year: 'Masters', program: 'M.Com' },
];

export const WORKING_CAMPAIGN_NAME = 'DHANYADHAN';
export const WORKING_TAGLINE = 'Every Grain Counts.';
export const WORKING_SECONDARY_TAGLINE = '17 Classes. One Goal.';

// Initial state before SDG Cell finalizes values:
export const INITIAL_UNCONFIGURED_CAMPAIGN: CampaignConfig = {
  campaignId: 'default',
  name: WORKING_CAMPAIGN_NAME,
  tagline: WORKING_TAGLINE,
  secondaryTagline: WORKING_SECONDARY_TAGLINE,
  targetKg: null,
  moneyToKgRate: null,
  acceptedGrains: [],
  milestones: [],
  showTotalMoneyPublicly: false,
  showTotalGrainKgPublicly: false,
  startDate: null,
  endDate: null,
  status: 'draft',
  institutionalMessaging: 'Department of Commerce / SDG Cell social-impact initiative.',
  isConfigured: false,
  conversionVersion: 1,
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

// Explicit development / demo preset (activated ONLY if explicitly chosen by admin for testing)
export const DEMO_PRESET_CAMPAIGN: Partial<CampaignConfig> = {
  targetKg: 5000,
  moneyToKgRate: 25,
  acceptedGrains: [
    { id: 'rice', name: 'Rice', conversionFactor: 1.0 },
    { id: 'wheat', name: 'Wheat', conversionFactor: 1.0 },
    { id: 'dal', name: 'Dal / Pulses', conversionFactor: 1.2 },
  ],
  milestones: [500, 1000, 2500, 5000],
  showTotalMoneyPublicly: true,
  showTotalGrainKgPublicly: true,
  status: 'active',
  isConfigured: true,
};
