import { CampaignConfig, ClassDoc, StudentDoc } from './types';

export interface CalculationResult {
  equivalentKg: number;
  moneyToKgRateUsed: number;
  grainConversionFactorUsed: number;
  conversionVersion: number;
}

export interface ContributionInput {
  type: 'money' | 'grain' | 'both';
  moneyAmount?: number;
  grainType?: string | null;
  grainQuantityKg?: number | null;
}

const MAX_MONEY_AMOUNT = 1_000_000; // Max ₹10 Lakhs per transaction
const MAX_GRAIN_KG = 50_000;       // Max 50 Tons per transaction
const VALID_TYPES = new Set(['money', 'grain', 'both']);

/**
 * Calculates official equivalent KG using active campaign configuration.
 * Throws an error if campaign configuration is incomplete or values are invalid.
 */
export function calculateEquivalentKg(
  input: ContributionInput,
  config: CampaignConfig
): CalculationResult {
  if (!VALID_TYPES.has(input.type)) {
    throw new Error(`Invalid contribution type: "${input.type}". Must be 'money', 'grain', or 'both'.`);
  }

  let equivalentKg = 0;
  let moneyToKgRateUsed = 0;
  let grainConversionFactorUsed = 0;

  const hasMoney = input.type === 'money' || input.type === 'both';
  const hasGrain = input.type === 'grain' || input.type === 'both';

  if (hasMoney) {
    const money = Number(input.moneyAmount);
    if (!Number.isFinite(money) || money <= 0) {
      throw new Error('Money amount must be a positive finite number greater than 0.');
    }
    if (money > MAX_MONEY_AMOUNT) {
      throw new Error(`Money amount exceeds maximum allowed limit of ₹${MAX_MONEY_AMOUNT.toLocaleString()}.`);
    }
    if (!config.moneyToKgRate || config.moneyToKgRate <= 0 || !Number.isFinite(config.moneyToKgRate)) {
      throw new Error('Campaign Money-to-KG conversion rate is not yet configured by the SDG Cell.');
    }
    moneyToKgRateUsed = config.moneyToKgRate;
    equivalentKg += money / config.moneyToKgRate;
  }

  if (hasGrain) {
    const qty = Number(input.grainQuantityKg);
    if (!Number.isFinite(qty) || qty <= 0) {
      throw new Error('Grain quantity must be a positive finite number greater than 0 KG.');
    }
    if (qty > MAX_GRAIN_KG) {
      throw new Error(`Grain quantity exceeds maximum allowed limit of ${MAX_GRAIN_KG} KG.`);
    }

    const requestedType = input.grainType || 'Rice';
    let grainRule = config.acceptedGrains.find(
      (g) => g.id.toLowerCase() === requestedType.toLowerCase() || g.name.toLowerCase() === requestedType.toLowerCase()
    );

    if (!grainRule) {
      grainRule = config.acceptedGrains.length > 0
        ? config.acceptedGrains[0]
        : { id: 'rice', name: 'Rice', conversionFactor: 1.0 };
    }

    grainConversionFactorUsed = grainRule.conversionFactor;
    equivalentKg += qty * grainRule.conversionFactor;
  }

  // Safe 2-decimal rounding with Number.EPSILON to avoid IEEE 754 precision issues
  const roundedEquivalentKg = Math.round((equivalentKg + Number.EPSILON) * 100) / 100;

  return {
    equivalentKg: roundedEquivalentKg,
    moneyToKgRateUsed,
    grainConversionFactorUsed,
    conversionVersion: config.conversionVersion || 1,
  };
}

/**
 * Deterministic tie-breaking for classes.
 * 1. Primary: totalEquivalentKg (descending)
 * 2. Secondary: contributorCount (unique students participating, descending)
 * 3. Tertiary: contributionCount (total transactions, descending)
 * 4. Quaternary: class name (alphabetical, ascending)
 */
export function sortClassesWithRanks(classes: ClassDoc[]): ClassDoc[] {
  // Only classes that have recorded contributions appear and receive a rank:
  const contributing = classes.filter((c) => (c.totalEquivalentKg || 0) > 0);

  const sorted = [...contributing].sort((a, b) => {
    if (b.totalEquivalentKg !== a.totalEquivalentKg) {
      return b.totalEquivalentKg - a.totalEquivalentKg;
    }
    if (b.contributorCount !== a.contributorCount) {
      return b.contributorCount - a.contributorCount;
    }
    if (b.contributionCount !== a.contributionCount) {
      return b.contributionCount - a.contributionCount;
    }
    return a.name.localeCompare(b.name);
  });

  return sorted.map((item, index) => ({
    ...item,
    currentRank: index + 1,
  }));
}

/**
 * Deterministic tie-breaking for students.
 * 1. Primary: totalEquivalentKg (descending)
 * 2. Secondary: firstContributedAt (earliest timestamp)
 * 3. Tertiary: name (alphabetical, ascending)
 */
export function sortStudentsWithRanks(students: StudentDoc[]): Array<StudentDoc & { rank: number }> {
  const sorted = [...students].sort((a, b) => {
    if (b.totalEquivalentKg !== a.totalEquivalentKg) {
      return b.totalEquivalentKg - a.totalEquivalentKg;
    }
    if (a.firstContributedAt && b.firstContributedAt) {
      const timeDiff = new Date(a.firstContributedAt).getTime() - new Date(b.firstContributedAt).getTime();
      if (timeDiff !== 0) return timeDiff;
    } else if (a.firstContributedAt && !b.firstContributedAt) {
      return -1;
    } else if (!a.firstContributedAt && b.firstContributedAt) {
      return 1;
    }
    return a.name.localeCompare(b.name);
  });

  return sorted.map((student, index) => ({
    ...student,
    rank: index + 1,
  }));
}
