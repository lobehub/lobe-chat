import { describe, expect, it } from 'vitest';

import { Pricing } from '@/types/aiModel';

import {
  getAudioInputUnitRate,
  getAudioOutputUnitRate,
  getCachedAudioInputUnitRate,
  getCachedTextInputUnitRate,
  getConditionalRates,
  getContextAwareRate,
  getTextInputUnitRate,
  getTextOutputUnitRate,
  getUnitRateByName,
  getWriteCacheInputUnitRate,
  hasConditionalPricing,
} from './pricing';

describe('pricing utilities (new)', () => {
  describe('getUnitRateByName', () => {
    it('returns undefined when pricing or unitName is missing', () => {
      expect(getUnitRateByName()).toBeUndefined();
      const p = { units: [] } as Pricing;
      expect(getUnitRateByName(p)).toBeUndefined();
    });

    it('returns undefined when unit not found', () => {
      const pricing: Pricing = {
        units: [{ name: 'textOutput', strategy: 'fixed', unit: 'millionTokens', rate: 0.002 }],
      };
      expect(getUnitRateByName(pricing, 'textInput')).toBeUndefined();
    });

    it('handles fixed strategy', () => {
      const pricing: Pricing = {
        units: [{ name: 'textInput', strategy: 'fixed', unit: 'millionTokens', rate: 0.001 }],
      };
      expect(getUnitRateByName(pricing, 'textInput')).toBe(0.001);
    });

    it('handles tiered strategy (first tier)', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'audioInput',
            strategy: 'tiered',
            unit: 'second',
            tiers: [
              { rate: 0.01, upTo: 3600 },
              { rate: 0.008, upTo: 'infinity' },
            ],
          },
        ],
      };
      expect(getUnitRateByName(pricing, 'audioInput')).toBe(0.01);
    });

    it('returns undefined when tiered.tiers is absent or empty', () => {
      const noTiers: Pricing = {
        units: [
          { name: 'textInput', strategy: 'tiered', unit: 'millionTokens', tiers: undefined as any },
        ],
      };
      const emptyTiers: Pricing = {
        units: [{ name: 'textInput', strategy: 'tiered', unit: 'millionTokens', tiers: [] }],
      };
      expect(getUnitRateByName(noTiers, 'textInput')).toBeUndefined();
      expect(getUnitRateByName(emptyTiers, 'textInput')).toBeUndefined();
    });

    it('handles lookup strategy (first price value)', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'textInput',
            strategy: 'lookup',
            unit: 'millionTokens',
            lookup: {
              pricingParams: ['model'],
              prices: { a: 0.001, b: 0.03 },
            },
          },
        ],
      };
      expect(getUnitRateByName(pricing, 'textInput')).toBe(0.001);
    });

    it('returns undefined when lookup missing or has no prices', () => {
      const missingLookup: Pricing = {
        units: [
          {
            name: 'textInput',
            strategy: 'lookup',
            unit: 'millionTokens',
            lookup: undefined as any,
          },
        ],
      } as any;
      const emptyPrices: Pricing = {
        units: [
          {
            name: 'textInput',
            strategy: 'lookup',
            unit: 'millionTokens',
            lookup: { pricingParams: ['model'], prices: {} },
          },
        ],
      };
      expect(getUnitRateByName(missingLookup, 'textInput')).toBeUndefined();
      expect(getUnitRateByName(emptyPrices, 'textInput')).toBeUndefined();
    });

    it('works with multiple units', () => {
      const pricing: Pricing = {
        units: [
          { name: 'textInput', strategy: 'fixed', unit: 'millionTokens', rate: 0.001 },
          { name: 'textOutput', strategy: 'fixed', unit: 'millionTokens', rate: 0.002 },
          {
            name: 'audioInput',
            strategy: 'tiered',
            unit: 'second',
            tiers: [
              { rate: 0.01, upTo: 3600 },
              { rate: 0.008, upTo: 'infinity' },
            ],
          },
        ],
      };
      expect(getUnitRateByName(pricing, 'textInput')).toBe(0.001);
      expect(getUnitRateByName(pricing, 'textOutput')).toBe(0.002);
      expect(getUnitRateByName(pricing, 'audioInput')).toBe(0.01);
    });
  });

  describe('wrapper helpers', () => {
    it('return the same values as getUnitRateByName for each unit', () => {
      const pricing: Pricing = {
        units: [
          { name: 'textInput', strategy: 'fixed', unit: 'millionTokens', rate: 0.001 },
          { name: 'textOutput', strategy: 'fixed', unit: 'millionTokens', rate: 0.002 },
          {
            name: 'audioInput',
            strategy: 'tiered',
            unit: 'second',
            tiers: [
              { rate: 0.01, upTo: 3600 },
              { rate: 0.008, upTo: 'infinity' },
            ],
          },
          { name: 'audioOutput', strategy: 'fixed', unit: 'second', rate: 0.015 },
          { name: 'textInput_cacheRead', strategy: 'fixed', unit: 'millionTokens', rate: 0.0005 },
          {
            name: 'textInput_cacheWrite',
            strategy: 'lookup',
            unit: 'millionTokens',
            lookup: { pricingParams: ['ttl'], prices: { '5': 0.2, '60': 0.6 } },
          },
          { name: 'audioInput_cacheRead', strategy: 'fixed', unit: 'second', rate: 0.005 },
        ],
      };

      expect(getTextInputUnitRate(pricing)).toBe(getUnitRateByName(pricing, 'textInput'));
      expect(getTextOutputUnitRate(pricing)).toBe(getUnitRateByName(pricing, 'textOutput'));
      expect(getAudioInputUnitRate(pricing)).toBe(getUnitRateByName(pricing, 'audioInput'));
      expect(getAudioOutputUnitRate(pricing)).toBe(getUnitRateByName(pricing, 'audioOutput'));
      expect(getCachedTextInputUnitRate(pricing)).toBe(
        getUnitRateByName(pricing, 'textInput_cacheRead'),
      );
      expect(getWriteCacheInputUnitRate(pricing)).toBe(
        getUnitRateByName(pricing, 'textInput_cacheWrite'),
      );
      expect(getCachedAudioInputUnitRate(pricing)).toBe(
        getUnitRateByName(pricing, 'audioInput_cacheRead'),
      );

      // also validate expected concrete values for clarity
      expect(getTextInputUnitRate(pricing)).toBe(0.001);
      expect(getTextOutputUnitRate(pricing)).toBe(0.002);
      expect(getAudioInputUnitRate(pricing)).toBe(0.01);
      expect(getAudioOutputUnitRate(pricing)).toBe(0.015);
      expect(getCachedTextInputUnitRate(pricing)).toBe(0.0005);
      expect(getWriteCacheInputUnitRate(pricing)).toBe(0.2);
      expect(getCachedAudioInputUnitRate(pricing)).toBe(0.005);
    });
  });

  describe('conditional pricing', () => {
    const conditionalPricing: Pricing = {
      currency: 'CNY',
      units: [
        {
          name: 'textInput',
          strategy: 'conditional',
          unit: 'millionTokens',
          relatedUnits: ['textInput', 'textOutput'],
          tiers: [
            {
              conditions: [{ param: 'inputLength', range: [0, 32] }],
              rates: { textInput: 2, textOutput: 6 },
            },
            {
              conditions: [{ param: 'inputLength', range: [33, 'infinity'] }],
              rates: { textInput: 4, textOutput: 12 },
            },
          ],
        },
        {
          name: 'imageGeneration',
          strategy: 'conditional',
          unit: 'image',
          relatedUnits: ['imageGeneration'],
          tiers: [
            {
              conditions: [
                { param: 'imageCount', range: [1, 10] },
                { param: 'inputLength', range: [0, 100] },
              ],
              rates: { imageGeneration: 0.1 },
            },
            {
              conditions: [{ param: 'imageCount', range: [11, 'infinity'] }],
              rates: { imageGeneration: 0.08 },
            },
          ],
        },
      ],
    };

    it('handles conditional pricing with matching context', () => {
      const context = { inputLength: 20 };
      expect(getTextInputUnitRate(conditionalPricing, context)).toBe(2);
      expect(getTextOutputUnitRate(conditionalPricing, context)).toBe(6);

      const context2 = { inputLength: 50 };
      expect(getTextInputUnitRate(conditionalPricing, context2)).toBe(4);
      expect(getTextOutputUnitRate(conditionalPricing, context2)).toBe(12);
    });

    it('handles multiple conditions for conditional pricing', () => {
      const context1 = { imageCount: 5, inputLength: 50 };
      expect(getUnitRateByName(conditionalPricing, 'imageGeneration', context1)).toBe(0.1);

      const context2 = { imageCount: 15, inputLength: 50 };
      expect(getUnitRateByName(conditionalPricing, 'imageGeneration', context2)).toBe(0.08);
    });

    it('falls back to first tier when context is missing', () => {
      expect(getTextInputUnitRate(conditionalPricing)).toBe(2);
      expect(getTextOutputUnitRate(conditionalPricing)).toBe(6);
    });

    it('falls back to first tier when conditions do not match', () => {
      const context = { someOtherParam: 100 };
      expect(getTextInputUnitRate(conditionalPricing, context)).toBe(2);
      expect(getTextOutputUnitRate(conditionalPricing, context)).toBe(6);
    });

    it('getConditionalRates returns rates for all related units', () => {
      const context = { inputLength: 20 };
      const rates = getConditionalRates(conditionalPricing, context);
      expect(rates.textInput).toBe(2);
      expect(rates.textOutput).toBe(6);
    });

    it('hasConditionalPricing correctly identifies conditional pricing', () => {
      expect(hasConditionalPricing(conditionalPricing)).toBe(true);

      const fixedPricing: Pricing = {
        units: [{ name: 'textInput', strategy: 'fixed', unit: 'millionTokens', rate: 0.001 }],
      };
      expect(hasConditionalPricing(fixedPricing)).toBe(false);
    });

    it('getContextAwareRate prioritizes conditional pricing when context is available', () => {
      const context = { inputLength: 50 };
      expect(getContextAwareRate(conditionalPricing, 'textInput', context)).toBe(4);
      expect(getContextAwareRate(conditionalPricing, 'textOutput', context)).toBe(12);
    });
  });
});
