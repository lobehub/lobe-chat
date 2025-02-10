import { describe, expect, it } from 'vitest';

import { Kibi, exponent, getRealValue, powerKibi } from './MaxTokenSlider';

describe('MaxTokenSlider utility functions', () => {
  describe('exponent', () => {
    it('should calculate log2 correctly', () => {
      expect(exponent(2)).toBe(1);
      expect(exponent(4)).toBe(2);
      expect(exponent(8)).toBe(3);
      expect(exponent(16)).toBe(4);
      expect(exponent(1024)).toBe(10);
    });
  });

  describe('getRealValue', () => {
    it('should calculate 2^x correctly', () => {
      expect(getRealValue(1)).toBe(2);
      expect(getRealValue(2)).toBe(4);
      expect(getRealValue(3)).toBe(8);
      expect(getRealValue(4)).toBe(16);
      expect(getRealValue(10)).toBe(1024);
    });
  });

  describe('powerKibi', () => {
    it('should calculate 2^x * 1024 correctly', () => {
      expect(powerKibi(1)).toBe(2048);
      expect(powerKibi(2)).toBe(4096);
      expect(powerKibi(3)).toBe(8192);
      expect(powerKibi(4)).toBe(16384);
      expect(powerKibi(10)).toBe(1048576);
    });
  });

  describe('Kibi constant', () => {
    it('should equal 1024', () => {
      expect(Kibi).toBe(1024);
    });
  });
});
