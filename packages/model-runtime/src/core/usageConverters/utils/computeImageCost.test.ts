import type { Pricing } from 'model-bank';
import { describe, expect, it } from 'vitest';

import { ImageGenerationParams, computeImageCost } from './computeImageCost';

describe('computeImageCost', () => {
  it('should compute dall-e-3 lookup pricing correctly', () => {
    // Arrange - Based on actual production logs
    const pricing: Pricing = {
      units: [
        {
          name: 'imageGeneration',
          strategy: 'lookup',
          unit: 'image',
          lookup: {
            pricingParams: ['quality', 'size'],
            prices: {
              standard_1024x1024: 0.04,
              standard_1024x1792: 0.08,
              standard_1792x1024: 0.08,
              hd_1024x1024: 0.08,
              hd_1024x1792: 0.12,
              hd_1792x1024: 0.12,
            },
          },
        },
      ],
    };

    const params: ImageGenerationParams = {
      quality: 'standard',
      size: '1024x1024',
      prompt: '一条边牧',
    };

    // Act
    const result = computeImageCost(pricing, params, 1);

    // Assert - Match the production log output
    expect(result).toBeDefined();
    expect(result?.totalCost).toBe(0.04);
    expect(result?.totalCredits).toBe(40000); // $0.04 * 100000 credits per dollar
    expect(result?.breakdown?.lookupKey).toBe('standard_1024x1024');
    expect(result?.breakdown?.pricePerImage).toBe(0.04);
    expect(result?.breakdown?.imageCount).toBe(1);
  });
});
