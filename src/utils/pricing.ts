import { Pricing } from '@/types/aiModel';

/**
 * Get text input unit rate from pricing
 * - fixed → rate
 * - tiered → tiers[0].rate
 * - lookup → Object.values(lookup.prices)[0]
 */
export function getTextInputUnitRate(pricing?: Pricing): number | undefined {
  if (!pricing?.units) return undefined;

  const textInputUnit = pricing.units.find((unit) => unit.name === 'TextInput');
  if (!textInputUnit) return undefined;

  switch (textInputUnit.strategy) {
    case 'fixed': {
      return textInputUnit.rate;
    }
    case 'tiered': {
      return textInputUnit.tiers?.[0]?.rate;
    }
    case 'lookup': {
      const prices = Object.values(textInputUnit.lookup?.prices || {});
      return prices[0];
    }
    default: {
      return undefined;
    }
  }
}

/**
 * Get text output unit rate from pricing
 */
export function getTextOutputUnitRate(pricing?: Pricing): number | undefined {
  if (!pricing?.units) return undefined;

  const textOutputUnit = pricing.units.find((unit) => unit.name === 'TextOutput');
  if (!textOutputUnit) return undefined;

  switch (textOutputUnit.strategy) {
    case 'fixed': {
      return textOutputUnit.rate;
    }
    case 'tiered': {
      return textOutputUnit.tiers?.[0]?.rate;
    }
    case 'lookup': {
      const prices = Object.values(textOutputUnit.lookup?.prices || {});
      return prices[0];
    }
    default: {
      return undefined;
    }
  }
}

/**
 * Get audio input unit rate from pricing
 */
export function getAudioInputUnitRate(pricing?: Pricing): number | undefined {
  if (!pricing?.units) return undefined;

  const audioInputUnit = pricing.units.find((unit) => unit.name === 'AudioInput');
  if (!audioInputUnit) return undefined;

  switch (audioInputUnit.strategy) {
    case 'fixed': {
      return audioInputUnit.rate;
    }
    case 'tiered': {
      return audioInputUnit.tiers?.[0]?.rate;
    }
    case 'lookup': {
      const prices = Object.values(audioInputUnit.lookup?.prices || {});
      return prices[0];
    }
    default: {
      return undefined;
    }
  }
}

/**
 * Get audio output unit rate from pricing
 */
export function getAudioOutputUnitRate(pricing?: Pricing): number | undefined {
  if (!pricing?.units) return undefined;

  const audioOutputUnit = pricing.units.find((unit) => unit.name === 'AudioOutput');
  if (!audioOutputUnit) return undefined;

  switch (audioOutputUnit.strategy) {
    case 'fixed': {
      return audioOutputUnit.rate;
    }
    case 'tiered': {
      return audioOutputUnit.tiers?.[0]?.rate;
    }
    case 'lookup': {
      const prices = Object.values(audioOutputUnit.lookup?.prices || {});
      return prices[0];
    }
    default: {
      return undefined;
    }
  }
}

/**
 * Get cached text input unit rate from pricing
 */
export function getCachedTextInputUnitRate(pricing?: Pricing): number | undefined {
  if (!pricing?.units) return undefined;

  const cachedInputUnit = pricing.units.find((unit) => unit.name === 'CachedTextInput');
  if (!cachedInputUnit) return undefined;

  switch (cachedInputUnit.strategy) {
    case 'fixed': {
      return cachedInputUnit.rate;
    }
    case 'tiered': {
      return cachedInputUnit.tiers?.[0]?.rate;
    }
    case 'lookup': {
      const prices = Object.values(cachedInputUnit.lookup?.prices || {});
      return prices[0];
    }
    default: {
      return undefined;
    }
  }
}

/**
 * Get write cache input unit rate from pricing (TextInputCacheWrite)
 */
export function getWriteCacheInputUnitRate(pricing?: Pricing): number | undefined {
  if (!pricing?.units) return undefined;

  const writeCacheUnit = pricing.units.find((unit) => unit.name === 'TextInputCacheWrite');
  if (!writeCacheUnit) return undefined;

  switch (writeCacheUnit.strategy) {
    case 'fixed': {
      return writeCacheUnit.rate;
    }
    case 'tiered': {
      return writeCacheUnit.tiers?.[0]?.rate;
    }
    case 'lookup': {
      const prices = Object.values(writeCacheUnit.lookup?.prices || {});
      return prices[0];
    }
    default: {
      return undefined;
    }
  }
}

/**
 * Get cached audio input unit rate from pricing
 */
export function getCachedAudioInputUnitRate(pricing?: Pricing): number | undefined {
  if (!pricing?.units) return undefined;

  const cachedAudioUnit = pricing.units.find((unit) => unit.name === 'CachedAudioInput');
  if (!cachedAudioUnit) return undefined;

  switch (cachedAudioUnit.strategy) {
    case 'fixed': {
      return cachedAudioUnit.rate;
    }
    case 'tiered': {
      return cachedAudioUnit.tiers?.[0]?.rate;
    }
    case 'lookup': {
      const prices = Object.values(cachedAudioUnit.lookup?.prices || {});
      return prices[0];
    }
    default: {
      return undefined;
    }
  }
}
