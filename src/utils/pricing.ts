import { ConditionalPricingUnit, Pricing, PricingUnit, PricingUnitName } from '@/types/aiModel';
import { ModelTokensUsage } from '@/types/message';

/**
 * Context parameters for conditional pricing evaluation
 */
export interface PricingContext {
  [key: string]: number | undefined;
  audioLength?: number;
  imageCount?: number;
  inputLength?: number;
  outputLength?: number;
}

/**
 * Check if a value falls within a given range
 */
const isInRange = (value: number, range: [number, number | 'infinity']): boolean => {
  const [min, max] = range;
  if (max === 'infinity') {
    return value >= min;
  }
  return value >= min && value <= max;
};

/**
 * Create PricingContext from ModelTokensUsage
 * This function converts token usage data into context for conditional pricing evaluation
 */
export const createPricingContext = (usage?: ModelTokensUsage): PricingContext => {
  if (!usage) return {};

  return {
    // Use inputAudioTokens as audioLength if available
    audioLength: usage.inputAudioTokens,
    // Use totalInputTokens as inputLength for conditional pricing evaluation
    inputLength: usage.totalInputTokens,
    // Use totalOutputTokens as outputLength for conditional pricing evaluation
    outputLength: usage.totalOutputTokens,
    // Note: imageCount would need to be added to ModelTokensUsage if needed for image-based pricing
  };
};

/**
 * Get all related units from a conditional pricing unit by extracting keys from rates
 */
export const getRelatedUnitsFromConditionalUnit = (
  unit: ConditionalPricingUnit,
): PricingUnitName[] => {
  const relatedUnits = new Set<PricingUnitName>();

  for (const tier of unit.tiers) {
    for (const unitName of Object.keys(tier.rates)) {
      relatedUnits.add(unitName as PricingUnitName);
    }
  }

  return Array.from(relatedUnits);
};

/**
 * Find the matching tier for conditional pricing based on context
 * @internal - exported for testing purposes
 */
export const findMatchingTier = (
  unit: ConditionalPricingUnit,
  context: PricingContext = {},
): ConditionalPricingUnit['tiers'][0] | undefined => {
  for (const tier of unit.tiers) {
    const allConditionsMet = tier.conditions.every((condition) => {
      const value = context[condition.param];
      return value !== undefined && isInRange(value, condition.range);
    });

    if (allConditionsMet) {
      return tier;
    }
  }

  // Fallback to first tier if no conditions match
  return unit.tiers[0];
};

/**
 * Internal helper to extract the displayed unit rate from a pricing unit by strategy
 * - fixed → rate
 * - tiered → tiers[0].rate
 * - lookup → first price value
 * - conditional → handled separately in getUnitRateByName
 */
const getRateFromUnit = (
  unit: Exclude<PricingUnit, ConditionalPricingUnit>,
): number | undefined => {
  switch (unit.strategy) {
    case 'fixed': {
      return unit.rate;
    }
    case 'tiered': {
      return unit.tiers?.[0]?.rate;
    }
    case 'lookup': {
      const prices = Object.values(unit.lookup?.prices || {});
      return prices[0];
    }
    default: {
      return undefined;
    }
  }
};

/**
 * Get unit rate by unit name, used to deduplicate logic across helpers
 */
export const getUnitRateByName = (
  pricing?: Pricing,
  unitName?: PricingUnitName,
  context?: PricingContext,
): number | undefined => {
  if (!pricing?.units || !unitName) return undefined;

  // First, check if there's a conditional pricing unit that includes this unitName
  const conditionalUnit = pricing.units.find((unit): unit is ConditionalPricingUnit => {
    if (unit.strategy !== 'conditional') return false;
    // Check if any tier contains this unitName in its rates
    return unit.tiers.some((tier) => tier.rates[unitName] !== undefined);
  });

  if (conditionalUnit) {
    const matchingTier = findMatchingTier(conditionalUnit, context);
    const rate = matchingTier?.rates[unitName];
    if (rate !== undefined) {
      return rate;
    }
  }

  // Fallback to direct unit lookup (only for non-conditional units)
  const unit = pricing.units.find(
    (u): u is Exclude<PricingUnit, ConditionalPricingUnit> =>
      u.strategy !== 'conditional' && 'name' in u && u.name === unitName,
  );
  if (!unit) return undefined;
  return getRateFromUnit(unit);
};

/**
 * Get text input unit rate from pricing
 * - fixed → rate
 * - tiered → tiers[0].rate
 * - lookup → Object.values(lookup.prices)[0]
 * - conditional → rate based on context conditions
 */
export function getTextInputUnitRate(
  pricing?: Pricing,
  context?: PricingContext,
): number | undefined {
  return getUnitRateByName(pricing, 'textInput', context);
}

/**
 * Get text output unit rate from pricing
 */
export function getTextOutputUnitRate(
  pricing?: Pricing,
  context?: PricingContext,
): number | undefined {
  return getUnitRateByName(pricing, 'textOutput', context);
}

/**
 * Get audio input unit rate from pricing
 */
export function getAudioInputUnitRate(
  pricing?: Pricing,
  context?: PricingContext,
): number | undefined {
  return getUnitRateByName(pricing, 'audioInput', context);
}

/**
 * Get audio output unit rate from pricing
 */
export function getAudioOutputUnitRate(
  pricing?: Pricing,
  context?: PricingContext,
): number | undefined {
  return getUnitRateByName(pricing, 'audioOutput', context);
}

/**
 * Get cached text input unit rate from pricing
 */
export function getCachedTextInputUnitRate(
  pricing?: Pricing,
  context?: PricingContext,
): number | undefined {
  return getUnitRateByName(pricing, 'textInput_cacheRead', context);
}

/**
 * Get write cache input unit rate from pricing (TextInputCacheWrite)
 */
export function getWriteCacheInputUnitRate(
  pricing?: Pricing,
  context?: PricingContext,
): number | undefined {
  return getUnitRateByName(pricing, 'textInput_cacheWrite', context);
}

/**
 * Get cached audio input unit rate from pricing
 */
export function getCachedAudioInputUnitRate(
  pricing?: Pricing,
  context?: PricingContext,
): number | undefined {
  return getUnitRateByName(pricing, 'audioInput_cacheRead', context);
}

/**
 * Get conditional pricing units that affect multiple related units together
 */
export function getConditionalPricingUnits(pricing?: Pricing): ConditionalPricingUnit[] {
  if (!pricing?.units) return [];
  return pricing.units.filter(
    (unit): unit is ConditionalPricingUnit => unit.strategy === 'conditional',
  );
}

/**
 * Calculate rates for all related units in a conditional pricing scenario
 */
export function getConditionalRates(
  pricing: Pricing,
  context: PricingContext,
): Partial<Record<PricingUnitName, number>> {
  const rates: Partial<Record<PricingUnitName, number>> = {};
  const conditionalUnits = getConditionalPricingUnits(pricing);

  for (const unit of conditionalUnits) {
    const matchingTier = findMatchingTier(unit, context);
    if (matchingTier) {
      // Apply rates for all units defined in this tier's rates
      for (const [unitName, rate] of Object.entries(matchingTier.rates)) {
        if (rate !== undefined) {
          rates[unitName as PricingUnitName] = rate;
        }
      }
    }
  }

  return rates;
}

/**
 * Check if pricing configuration contains conditional pricing units
 */
export function hasConditionalPricing(pricing?: Pricing): boolean {
  return getConditionalPricingUnits(pricing).length > 0;
}

/**
 * Get context-aware rate with fallback to regular rate calculation
 * This is the recommended function for getting rates when context might be available
 */
export function getContextAwareRate(
  pricing?: Pricing,
  unitName?: PricingUnitName,
  context?: PricingContext,
): number | undefined {
  if (!pricing?.units || !unitName) return undefined;

  // If context is provided and there are conditional pricing units, try conditional rates first
  if (context && hasConditionalPricing(pricing)) {
    const conditionalRates = getConditionalRates(pricing, context);
    if (conditionalRates[unitName] !== undefined) {
      return conditionalRates[unitName];
    }
  }

  // Fallback to regular unit rate calculation
  return getUnitRateByName(pricing, unitName, context);
}

/**
 * Get text input unit rate from ModelTokensUsage
 * This is a convenience function that automatically creates PricingContext from usage
 */
export function getTextInputUnitRateFromUsage(
  pricing?: Pricing,
  usage?: ModelTokensUsage,
): number | undefined {
  const context = createPricingContext(usage);
  return getTextInputUnitRate(pricing, context);
}

/**
 * Get text output unit rate from ModelTokensUsage
 * This is a convenience function that automatically creates PricingContext from usage
 */
export function getTextOutputUnitRateFromUsage(
  pricing?: Pricing,
  usage?: ModelTokensUsage,
): number | undefined {
  const context = createPricingContext(usage);
  return getTextOutputUnitRate(pricing, context);
}

/**
 * Calculate cost for a tiered pricing unit based on usage amount
 * @param unit - The tiered pricing unit
 * @param amount - The usage amount (in the unit's base unit, e.g., tokens)
 * @returns The calculated cost
 */
export function calculateTieredCost(
  unit: Extract<PricingUnit, { strategy: 'tiered' }>,
  amount: number,
): number {
  if (!unit.tiers || unit.tiers.length === 0) return 0;

  let cost = 0;
  let remaining = amount;
  let prevUpTo = 0;

  for (const tier of unit.tiers) {
    if (remaining <= 0) break;

    const upTo = tier.upTo === 'infinity' ? Infinity : tier.upTo;
    const bracket = Math.min(remaining, upTo - prevUpTo);

    if (bracket > 0) {
      cost += bracket * tier.rate;
      remaining -= bracket;
    }

    prevUpTo = upTo;
  }

  return cost;
}

/**
 * Get tiered pricing units from pricing configuration
 */
export function getTieredPricingUnits(
  pricing?: Pricing,
): Array<Extract<PricingUnit, { strategy: 'tiered' }>> {
  if (!pricing?.units) return [];
  return pricing.units.filter(
    (unit): unit is Extract<PricingUnit, { strategy: 'tiered' }> => unit.strategy === 'tiered',
  );
}

/**
 * Calculate cost for a specific unit using tiered pricing
 * @param pricing - The pricing configuration
 * @param unitName - The unit name to calculate cost for
 * @param amount - The usage amount
 * @returns The calculated cost, or undefined if unit not found or not tiered
 */
export function calculateTieredCostByUnitName(
  pricing?: Pricing,
  unitName?: PricingUnitName,
  amount?: number,
): number | undefined {
  if (!pricing?.units || !unitName || amount === undefined) return undefined;

  const unit = pricing.units.find(
    (u): u is Extract<PricingUnit, { strategy: 'tiered' }> =>
      u.strategy === 'tiered' && 'name' in u && u.name === unitName,
  );

  if (!unit) return undefined;

  return calculateTieredCost(unit, amount);
}

/**
 * Calculate text input cost using tiered pricing
 * @param pricing - The pricing configuration
 * @param tokenAmount - The number of tokens used
 * @returns The calculated cost, or undefined if not tiered pricing
 */
export function calculateTextInputTieredCost(
  pricing?: Pricing,
  tokenAmount?: number,
): number | undefined {
  if (!tokenAmount) return undefined;
  return calculateTieredCostByUnitName(pricing, 'textInput', tokenAmount);
}

/**
 * Calculate text output cost using tiered pricing
 * @param pricing - The pricing configuration
 * @param tokenAmount - The number of tokens used
 * @returns The calculated cost, or undefined if not tiered pricing
 */
export function calculateTextOutputTieredCost(
  pricing?: Pricing,
  tokenAmount?: number,
): number | undefined {
  if (!tokenAmount) return undefined;
  return calculateTieredCostByUnitName(pricing, 'textOutput', tokenAmount);
}

/**
 * Calculate total cost from ModelTokensUsage using tiered pricing where applicable
 * Falls back to rate-based calculation for non-tiered units
 */
export function calculateTotalCostFromUsage(
  pricing?: Pricing,
  usage?: ModelTokensUsage,
): {
  audioInputCost?: number;
  audioOutputCost?: number;
  cachedInputCost?: number;
  inputCost?: number;
  outputCost?: number;
  totalCost: number;
  writeCacheInputCost?: number;
} {
  if (!usage) {
    return { totalCost: 0 };
  }

  const context = createPricingContext(usage);
  let totalCost = 0;

  // Calculate text input cost (try tiered first, fallback to rate-based)
  let inputCost: number | undefined;
  if (usage.totalInputTokens) {
    inputCost = calculateTextInputTieredCost(pricing, usage.totalInputTokens);
    if (inputCost === undefined) {
      const rate = getTextInputUnitRate(pricing, context);
      inputCost = rate ? (usage.totalInputTokens * rate) / 1_000_000 : undefined;
    }
    if (inputCost !== undefined) totalCost += inputCost;
  }

  // Calculate text output cost (try tiered first, fallback to rate-based)
  let outputCost: number | undefined;
  if (usage.totalOutputTokens) {
    outputCost = calculateTextOutputTieredCost(pricing, usage.totalOutputTokens);
    if (outputCost === undefined) {
      const rate = getTextOutputUnitRate(pricing, context);
      outputCost = rate ? (usage.totalOutputTokens * rate) / 1_000_000 : undefined;
    }
    if (outputCost !== undefined) totalCost += outputCost;
  }

  // Calculate other costs using rate-based method
  let audioInputCost: number | undefined;
  if (usage.inputAudioTokens) {
    const rate = getAudioInputUnitRate(pricing, context);
    audioInputCost = rate ? (usage.inputAudioTokens * rate) / 1_000_000 : undefined;
    if (audioInputCost !== undefined) totalCost += audioInputCost;
  }

  let audioOutputCost: number | undefined;
  if (usage.outputAudioTokens) {
    const rate = getAudioOutputUnitRate(pricing, context);
    audioOutputCost = rate ? (usage.outputAudioTokens * rate) / 1_000_000 : undefined;
    if (audioOutputCost !== undefined) totalCost += audioOutputCost;
  }

  let cachedInputCost: number | undefined;
  if (usage.inputCachedTokens) {
    const rate = getCachedTextInputUnitRate(pricing, context);
    cachedInputCost = rate ? (usage.inputCachedTokens * rate) / 1_000_000 : undefined;
    if (cachedInputCost !== undefined) totalCost += cachedInputCost;
  }

  let writeCacheInputCost: number | undefined;
  if (usage.inputWriteCacheTokens) {
    const rate = getWriteCacheInputUnitRate(pricing, context);
    writeCacheInputCost = rate ? (usage.inputWriteCacheTokens * rate) / 1_000_000 : undefined;
    if (writeCacheInputCost !== undefined) totalCost += writeCacheInputCost;
  }

  return {
    audioInputCost,
    audioOutputCost,
    cachedInputCost,
    inputCost,
    outputCost,
    totalCost,
    writeCacheInputCost,
  };
}
