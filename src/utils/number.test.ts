import { describe, expect, it, vi } from 'vitest';

import { MAX_SEED, generateUniqueSeeds } from './number';

describe('number utilities', () => {
  describe('MAX_SEED constant', () => {
    it('should be 2^31 - 1', () => {
      expect(MAX_SEED).toBe(2147483647);
      expect(MAX_SEED).toBe(2 ** 31 - 1);
    });
  });

  describe('generateUniqueSeeds', () => {
    it('should generate the correct number of seeds', () => {
      const seedCount = 5;
      const seeds = generateUniqueSeeds(seedCount);

      expect(seeds).toHaveLength(seedCount);
    });

    it('should generate unique seeds', () => {
      const seedCount = 10;
      const seeds = generateUniqueSeeds(seedCount);

      // Convert to Set to check uniqueness
      const uniqueSeeds = new Set(seeds);
      expect(uniqueSeeds.size).toBe(seedCount);
    });

    it('should generate seeds within valid range', () => {
      const seedCount = 20;
      const seeds = generateUniqueSeeds(seedCount);

      seeds.forEach((seed) => {
        expect(seed).toBeGreaterThanOrEqual(0);
        expect(seed).toBeLessThanOrEqual(MAX_SEED);
        expect(Number.isInteger(seed)).toBe(true);
      });
    });

    it('should handle edge case of 0 seeds', () => {
      const seeds = generateUniqueSeeds(0);

      expect(seeds).toHaveLength(0);
      expect(Array.isArray(seeds)).toBe(true);
    });

    it('should handle edge case of 1 seed', () => {
      const seeds = generateUniqueSeeds(1);

      expect(seeds).toHaveLength(1);
      expect(seeds[0]).toBeGreaterThanOrEqual(0);
      expect(seeds[0]).toBeLessThanOrEqual(MAX_SEED);
    });

    it('should generate different results on different calls', () => {
      const seedCount = 5;

      // Generate seeds at different times to ensure different timestamps
      const seeds1 = generateUniqueSeeds(seedCount);

      // Add a small delay to ensure different timestamp
      vi.useFakeTimers();
      vi.advanceTimersByTime(1);
      const seeds2 = generateUniqueSeeds(seedCount);
      vi.useRealTimers();

      // The arrays should not be identical (very low probability of collision)
      expect(seeds1).not.toEqual(seeds2);
    });

    it('should handle larger seed counts', () => {
      const seedCount = 100;
      const seeds = generateUniqueSeeds(seedCount);

      expect(seeds).toHaveLength(seedCount);

      // Verify uniqueness
      const uniqueSeeds = new Set(seeds);
      expect(uniqueSeeds.size).toBe(seedCount);

      // Verify all are in valid range
      seeds.forEach((seed) => {
        expect(seed).toBeGreaterThanOrEqual(0);
        expect(seed).toBeLessThanOrEqual(MAX_SEED);
      });
    });

    it('should use current timestamp as initial seed', () => {
      const mockTimestamp = 1234567890123;
      vi.useFakeTimers();
      vi.setSystemTime(mockTimestamp);

      // Mock Date.now to verify it's being used
      const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

      generateUniqueSeeds(3);

      expect(dateSpy).toHaveBeenCalled();

      dateSpy.mockRestore();
      vi.useRealTimers();
    });
  });
});
