import type { Pricing, PricingUnit, PricingUnitName } from '../types/aiModel';

/** Rough CNY → USD factor; only the relative order of models matters here. */
const CNY_PER_USD = 7.2;

const unitRate = (unit: PricingUnit): number | undefined => {
  switch (unit.strategy) {
    case 'fixed': {
      return unit.rate;
    }
    case 'tiered': {
      return unit.tiers[0]?.rate;
    }
    case 'lookup': {
      return Object.values(unit.lookup.prices)[0];
    }
  }
};

/** USD per million tokens for one text pricing unit, if the model declares it. */
export const getTextRate = (pricing: Pricing | undefined, name: PricingUnitName) => {
  const unit = pricing?.units?.find((item) => item.name === name);
  const rate = unit ? unitRate(unit) : undefined;
  if (typeof rate !== 'number' || Number.isNaN(rate)) return;
  return pricing?.currency === 'CNY' ? rate / CNY_PER_USD : rate;
};

export interface ModelTextRates {
  cachedInput: number;
  input: number;
  output: number;
  writeCache: number;
}

/**
 * Input, output and prompt-cache rates (USD / 1M tokens). Missing cache rates
 * fall back to the input rate, i.e. "this model gets no cache discount".
 */
export const getModelTextRates = (pricing?: Pricing): ModelTextRates | undefined => {
  const input = getTextRate(pricing, 'textInput');
  const output = getTextRate(pricing, 'textOutput');
  if (input === undefined && output === undefined) return;

  const safeInput = input ?? output!;
  return {
    cachedInput: getTextRate(pricing, 'textInput_cacheRead') ?? safeInput,
    input: safeInput,
    output: output ?? safeInput,
    writeCache: getTextRate(pricing, 'textInput_cacheWrite') ?? safeInput,
  };
};

/** Blended price used as the capability proxy: input weighs 3:1, as chat turns read far more than they write. */
export const getBlendedRate = (pricing?: Pricing): number | undefined => {
  const rates = getModelTextRates(pricing);
  if (!rates) return;
  return (rates.input * 3 + rates.output) / 4;
};
