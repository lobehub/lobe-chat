import { describe, expect, it, vi } from 'vitest';

import { globalGeneralSelectors } from './general';

describe('globalGeneralSelectors', () => {
  describe('language', () => {
    it('should return language from system status', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockStore: any = {
        status: {
          language: 'en-US',
        },
      };

      expect(globalGeneralSelectors.language(mockStore)).toBe('en-US');
    });

    it('should return "auto" when language is not set', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockStore: any = {
        status: {
          language: undefined,
        },
      };

      expect(globalGeneralSelectors.language(mockStore)).toBe('auto');
    });

    it('should return "auto" when status is empty', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockStore: any = {
        status: {},
      };

      expect(globalGeneralSelectors.language(mockStore)).toBe('auto');
    });
  });
});
