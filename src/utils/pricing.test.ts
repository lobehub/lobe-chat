import { describe, expect, it } from 'vitest';

import { Pricing } from '@/types/aiModel';

import {
  getAudioInputUnitRate,
  getAudioOutputUnitRate,
  getCachedAudioInputUnitRate,
  getCachedTextInputUnitRate,
  getTextInputUnitRate,
  getTextOutputUnitRate,
  getWriteCacheInputUnitRate,
} from './pricing';

describe('pricing utilities', () => {
  describe('getTextInputUnitRate', () => {
    it('should return undefined when pricing is undefined', () => {
      expect(getTextInputUnitRate()).toBeUndefined();
    });

    it('should return undefined when pricing.units is undefined', () => {
      const pricing: Pricing = { units: undefined as any };
      expect(getTextInputUnitRate(pricing)).toBeUndefined();
    });

    it('should return undefined when TextInput unit is not found', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'TextOutput',
            strategy: 'fixed',
            unit: 'MillionTokens',
            rate: 0.002,
          },
        ],
      };
      expect(getTextInputUnitRate(pricing)).toBeUndefined();
    });

    it('should return rate for fixed strategy', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'TextInput',
            strategy: 'fixed',
            unit: 'MillionTokens',
            rate: 0.001,
          },
        ],
      };
      expect(getTextInputUnitRate(pricing)).toBe(0.001);
    });

    it('should return first tier rate for tiered strategy', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'TextInput',
            strategy: 'tiered',
            unit: 'MillionTokens',
            tiers: [
              { rate: 0.001, upTo: 1000000 },
              { rate: 0.0008, upTo: 'infinity' },
            ],
          },
        ],
      };
      expect(getTextInputUnitRate(pricing)).toBe(0.001);
    });

    it('should return undefined when tiered strategy has no tiers', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'TextInput',
            strategy: 'tiered',
            unit: 'MillionTokens',
            tiers: undefined as any,
          },
        ],
      };
      expect(getTextInputUnitRate(pricing)).toBeUndefined();
    });

    it('should return first price for lookup strategy', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'TextInput',
            strategy: 'lookup',
            unit: 'MillionTokens',
            lookup: {
              pricingParams: ['model'],
              prices: {
                'gpt-3.5-turbo': 0.001,
                'gpt-4': 0.03,
              },
            },
          },
        ],
      };
      expect(getTextInputUnitRate(pricing)).toBe(0.001);
    });

    it('should return undefined when lookup has no prices', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'TextInput',
            strategy: 'lookup',
            unit: 'MillionTokens',
            lookup: {
              pricingParams: ['model'],
              prices: {},
            },
          },
        ],
      };
      expect(getTextInputUnitRate(pricing)).toBeUndefined();
    });

    it('should return undefined for unknown strategy', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'TextInput',
            strategy: 'unknown' as any,
            unit: 'MillionTokens',
          } as any,
        ],
      };
      expect(getTextInputUnitRate(pricing)).toBeUndefined();
    });
  });

  describe('getTextOutputUnitRate', () => {
    it('should return undefined when pricing is undefined', () => {
      expect(getTextOutputUnitRate()).toBeUndefined();
    });

    it('should return undefined when TextOutput unit is not found', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'TextInput',
            strategy: 'fixed',
            unit: 'MillionTokens',
            rate: 0.001,
          },
        ],
      };
      expect(getTextOutputUnitRate(pricing)).toBeUndefined();
    });

    it('should return rate for fixed strategy', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'TextOutput',
            strategy: 'fixed',
            unit: 'MillionTokens',
            rate: 0.002,
          },
        ],
      };
      expect(getTextOutputUnitRate(pricing)).toBe(0.002);
    });
  });

  describe('getAudioInputUnitRate', () => {
    it('should return undefined when pricing is undefined', () => {
      expect(getAudioInputUnitRate()).toBeUndefined();
    });

    it('should return rate for AudioInput unit with fixed strategy', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'AudioInput',
            strategy: 'fixed',
            unit: 'Second',
            rate: 0.01,
          },
        ],
      };
      expect(getAudioInputUnitRate(pricing)).toBe(0.01);
    });
  });

  describe('getAudioOutputUnitRate', () => {
    it('should return rate for AudioOutput unit with fixed strategy', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'AudioOutput',
            strategy: 'fixed',
            unit: 'Second',
            rate: 0.015,
          },
        ],
      };
      expect(getAudioOutputUnitRate(pricing)).toBe(0.015);
    });
  });

  describe('getCachedTextInputUnitRate', () => {
    it('should return rate for CachedTextInput unit with fixed strategy', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'CachedTextInput',
            strategy: 'fixed',
            unit: 'MillionTokens',
            rate: 0.0005,
          },
        ],
      };
      expect(getCachedTextInputUnitRate(pricing)).toBe(0.0005);
    });
  });

  describe('getWriteCacheInputUnitRate', () => {
    it('should return rate for TextInputCacheWrite unit with fixed strategy', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'TextInputCacheWrite',
            strategy: 'fixed',
            unit: 'MillionTokens',
            rate: 0.001,
          },
        ],
      };
      expect(getWriteCacheInputUnitRate(pricing)).toBe(0.001);
    });
  });

  describe('getCachedAudioInputUnitRate', () => {
    it('should return rate for CachedAudioInput unit with fixed strategy', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'CachedAudioInput',
            strategy: 'fixed',
            unit: 'Second',
            rate: 0.005,
          },
        ],
      };
      expect(getCachedAudioInputUnitRate(pricing)).toBe(0.005);
    });
  });

  describe('edge cases and comprehensive scenarios', () => {
    it('should handle pricing with multiple units correctly', () => {
      const pricing: Pricing = {
        currency: 'USD',
        units: [
          {
            name: 'TextInput',
            strategy: 'fixed',
            unit: 'MillionTokens',
            rate: 0.001,
          },
          {
            name: 'TextOutput',
            strategy: 'fixed',
            unit: 'MillionTokens',
            rate: 0.002,
          },
          {
            name: 'AudioInput',
            strategy: 'tiered',
            unit: 'Second',
            tiers: [
              { rate: 0.01, upTo: 3600 },
              { rate: 0.008, upTo: 'infinity' },
            ],
          },
        ],
      };

      expect(getTextInputUnitRate(pricing)).toBe(0.001);
      expect(getTextOutputUnitRate(pricing)).toBe(0.002);
      expect(getAudioInputUnitRate(pricing)).toBe(0.01);
    });

    it('should handle lookup strategy with missing lookup object', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'TextInput',
            strategy: 'lookup',
            unit: 'MillionTokens',
            lookup: undefined as any,
          },
        ],
      };
      expect(getTextInputUnitRate(pricing)).toBeUndefined();
    });

    it('should return undefined when tiers array is empty', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'TextInput',
            strategy: 'tiered',
            unit: 'MillionTokens',
            tiers: [],
          },
        ],
      };
      expect(getTextInputUnitRate(pricing)).toBeUndefined();
    });
  });
});
