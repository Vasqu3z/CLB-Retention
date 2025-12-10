/**
 * Player Attribute Formulas for Radar Chart
 * Based on HO Formula v10 documentation
 */

// ===== CONSTANTS =====

/** Slap percentage by character class */
export const CLASS_SLAP_PERCENT: Record<string, number> = {
  'Power': 0.20,
  'Balanced': 0.40,
  'Technique': 0.60,
  'Speed': 0.80,
};

/** Charge swing outcome distributions by trajectory tier (T1-T6) */
export const CHARGE_OUTCOMES: Record<string, { gb: number; ll: number; hl: number; fb: number; df: number }> = {
  'T1': { gb: 0.20, ll: 0.18, hl: 0.14, fb: 0.31, df: 0.17 },
  'T2': { gb: 0.20, ll: 0.21, hl: 0.25, fb: 0.22, df: 0.12 },
  'T3': { gb: 0.11, ll: 0.20, hl: 0.36, fb: 0.24, df: 0.09 },
  'T4': { gb: 0.16, ll: 0.24, hl: 0.33, fb: 0.21, df: 0.06 },
  'T5': { gb: 0.13, ll: 0.20, hl: 0.36, fb: 0.25, df: 0.06 },
  'T6': { gb: 0.18, ll: 0.30, hl: 0.31, fb: 0.18, df: 0.03 },
};

/** Slap swing outcome distributions by trajectory tier (T1-T6) */
export const SLAP_OUTCOMES: Record<string, { gb: number; ll: number; hl: number; fb: number; df: number }> = {
  'T1': { gb: 0.25, ll: 0.28, hl: 0.17, fb: 0.20, df: 0.10 },
  'T2': { gb: 0.17, ll: 0.21, hl: 0.31, fb: 0.22, df: 0.09 },
  'T3': { gb: 0.14, ll: 0.22, hl: 0.38, fb: 0.20, df: 0.06 },
  'T4': { gb: 0.16, ll: 0.30, hl: 0.35, fb: 0.16, df: 0.03 },
  'T5': { gb: 0.16, ll: 0.24, hl: 0.39, fb: 0.18, df: 0.03 },
  'T6': { gb: 0.20, ll: 0.31, hl: 0.26, fb: 0.20, df: 0.03 },
};

/** Hit rates for charge swings */
export const CHARGE_HIT_RATES = {
  gb: 0.30,   // Ground ball: 30%
  ll: 0.81,   // Line low: 81%
  hl: 0.80,   // High liner: 80%
  // Air (FB+DF) uses HR_rate(CP)
};

/** Hit rates for slap swings */
export const SLAP_HIT_RATES = {
  gb: 0.10,   // Ground ball: 10%
  ll: 0.39,   // Line low: 39%
  hl: 0.74,   // High liner: 74%
  air: 0.71,  // Air (FB+DF): 71%
};

/** BA scaling bounds (from T1 Power anchor) */
export const BA_MIN = 0.387;
export const BA_MAX = 0.489;

/** ISO scaling bounds (from T1 Power anchor) */
export const ISO_MIN = 0.115;
export const ISO_MAX = 0.244;

// ===== HELPER FUNCTIONS =====

/**
 * Get the trajectory tier from hitting trajectory value
 * Maps trajectory string to T1-T6
 */
export function getTrajectoryTier(hittingTrajectory: string): string {
  // If already in T1-T6 format, return as-is
  if (/^T[1-6]$/.test(hittingTrajectory)) {
    return hittingTrajectory;
  }

  // Map common trajectory names to tiers
  const trajectoryMap: Record<string, string> = {
    'T1': 'T1',
    'T2': 'T2',
    'T3': 'T3',
    'T4': 'T4',
    'T5': 'T5',
    'T6': 'T6',
    // Add any other mappings if needed
  };

  return trajectoryMap[hittingTrajectory] || 'T3'; // Default to T3 if unknown
}

/**
 * Calculate Home Run rate based on Charge Power (CP)
 * HR_rate = 0.10 + (CP - 40) / 200 for CP < 94
 * HR_rate = 1.00 for CP >= 94
 */
export function calculateHRRate(chargePower: number): number {
  if (chargePower >= 94) {
    return 1.0;
  }
  return 0.10 + (chargePower - 40) / 200;
}

// ===== MAIN FORMULA FUNCTIONS =====

/**
 * Calculate Batting Average (BA)
 * BA = Base_BA + SP_Adjustment
 *
 * Base_BA = Σ(Outcome% × Hit_Rate) for charge and slap swings weighted by class
 * SP_Adjustment = 0.005 × (SP - 60) × Slap%
 */
export function calculateBA(
  characterClass: string,
  hittingTrajectory: string,
  slapHitPower: number,
  chargePower: number
): number {
  const tier = getTrajectoryTier(hittingTrajectory);
  const slapPercent = CLASS_SLAP_PERCENT[characterClass] ?? 0.40;
  const chargePercent = 1 - slapPercent;

  const chargeOutcomes = CHARGE_OUTCOMES[tier] || CHARGE_OUTCOMES['T3'];
  const slapOutcomes = SLAP_OUTCOMES[tier] || SLAP_OUTCOMES['T3'];

  // Calculate HR rate for charge air balls
  const hrRate = calculateHRRate(chargePower);

  // Charge swing BA contribution
  const chargeAirPercent = chargeOutcomes.fb + chargeOutcomes.df;
  const chargeBA =
    chargeOutcomes.gb * CHARGE_HIT_RATES.gb +
    chargeOutcomes.ll * CHARGE_HIT_RATES.ll +
    chargeOutcomes.hl * CHARGE_HIT_RATES.hl +
    chargeAirPercent * hrRate;

  // Slap swing BA contribution
  const slapAirPercent = slapOutcomes.fb + slapOutcomes.df;
  const slapBA =
    slapOutcomes.gb * SLAP_HIT_RATES.gb +
    slapOutcomes.ll * SLAP_HIT_RATES.ll +
    slapOutcomes.hl * SLAP_HIT_RATES.hl +
    slapAirPercent * SLAP_HIT_RATES.air;

  // Weighted base BA
  const baseBA = chargePercent * chargeBA + slapPercent * slapBA;

  // SP Adjustment
  const spAdjustment = 0.005 * (slapHitPower - 60) * slapPercent;

  return baseBA + spAdjustment;
}

/**
 * Calculate Isolated Power (ISO)
 * ISO = HR% × 3
 * HR% = Charge_Air% × HR_rate(CP)
 */
export function calculateISO(
  characterClass: string,
  hittingTrajectory: string,
  chargePower: number
): number {
  const tier = getTrajectoryTier(hittingTrajectory);
  const slapPercent = CLASS_SLAP_PERCENT[characterClass] ?? 0.40;
  const chargePercent = 1 - slapPercent;

  const chargeOutcomes = CHARGE_OUTCOMES[tier] || CHARGE_OUTCOMES['T3'];
  const chargeAirPercent = chargeOutcomes.fb + chargeOutcomes.df;

  const hrRate = calculateHRRate(chargePower);

  // HR% is weighted by charge percentage since only charge swings produce HRs in this model
  const hrPercent = chargePercent * chargeAirPercent * hrRate;

  return hrPercent * 3;
}

/**
 * Calculate Stuff (Pitching effectiveness)
 * Stuff = (fastballSpeed + curve) / 3
 */
export function calculateStuff(fastballSpeed: number, curve: number): number {
  return (fastballSpeed + curve) / 3;
}

// ===== SCALING FUNCTIONS =====

/**
 * Scale BA to 0-100 range
 */
export function scaleBA(ba: number): number {
  const scaled = ((ba - BA_MIN) / (BA_MAX - BA_MIN)) * 100;
  return Math.max(0, Math.min(100, scaled));
}

/**
 * Scale ISO to 0-100 range
 */
export function scaleISO(iso: number): number {
  const scaled = ((iso - ISO_MIN) / (ISO_MAX - ISO_MIN)) * 100;
  return Math.max(0, Math.min(100, scaled));
}

/**
 * Scale Speed (0-150) to 0-100 range
 */
export function scaleSpeed(speed: number): number {
  return Math.max(0, Math.min(100, (speed / 150) * 100));
}

/**
 * Clamp a value to 0-100 (for stats already on 0-100 scale)
 */
export function clamp100(value: number): number {
  return Math.max(0, Math.min(100, value));
}

// ===== RADAR CHART DATA =====

export interface RadarAttributes {
  average: number;  // Scaled 0-100
  power: number;    // Scaled 0-100
  stuff: number;    // Scaled 0-100
  stamina: number;  // Raw 0-100
  fielding: number; // Raw 0-100
  arm: number;      // Raw 0-100
  speed: number;    // Scaled 0-100
}

export interface PlayerAttributeInput {
  characterClass: string;
  hittingTrajectory: string;
  slapHitPower: number;
  chargeHitPower: number;
  fastballSpeed: number;
  curve: number;
  stamina: number;
  fielding: number;
  throwingSpeed: number;
  speed: number;
}

/**
 * Calculate all radar chart attributes for a player
 */
export function calculateRadarAttributes(input: PlayerAttributeInput): RadarAttributes {
  // Calculate raw values
  const rawBA = calculateBA(
    input.characterClass,
    input.hittingTrajectory,
    input.slapHitPower,
    input.chargeHitPower
  );

  const rawISO = calculateISO(
    input.characterClass,
    input.hittingTrajectory,
    input.chargeHitPower
  );

  const rawStuff = calculateStuff(input.fastballSpeed, input.curve);

  // Scale to 0-100
  return {
    average: scaleBA(rawBA),
    power: scaleISO(rawISO),
    stuff: clamp100(rawStuff),
    stamina: clamp100(input.stamina),
    fielding: clamp100(input.fielding),
    arm: clamp100(input.throwingSpeed),
    speed: scaleSpeed(input.speed),
  };
}
