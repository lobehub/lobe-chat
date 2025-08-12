import { ConditionalPricingUnit, Pricing, PricingUnit, PricingUnitName } from '@/types/aiModel';

/**
 * Context parameters for conditional pricing evaluation
 */
export interface PricingContext {
  [key: string]: number | undefined;
  audioLength?: number;
  imageCount?: number;
  inputLength?: number;
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
 * - conditional → first tier's rate for the unit, or fallback based on context
 */
const getRateFromUnit = (
  unit: PricingUnit,
  context: PricingContext = {},
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
    case 'conditional': {
      const matchingTier = findMatchingTier(unit, context);
      return matchingTier?.rates[unit.name];
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

  // First, check if there's a conditional pricing unit that includes this unitName in relatedUnits
  const conditionalUnit = pricing.units.find((unit): unit is ConditionalPricingUnit => 
    unit.strategy === 'conditional' && unit.relatedUnits.includes(unitName)
  );

  if (conditionalUnit) {
    const matchingTier = findMatchingTier(conditionalUnit, context);
    const rate = matchingTier?.rates[unitName];
    if (rate !== undefined) {
      return rate;
    }
  }

  // Fallback to direct unit lookup
  const unit = pricing.units.find((u) => u.name === unitName);
  if (!unit) return undefined;
  return getRateFromUnit(unit, context);
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
  return pricing.units.filter((unit): unit is ConditionalPricingUnit => 
    unit.strategy === 'conditional'
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
      // Apply rates for all related units from this tier
      for (const relatedUnit of unit.relatedUnits) {
        const rate = matchingTier.rates[relatedUnit];
        if (rate !== undefined) {
          rates[relatedUnit] = rate;
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
