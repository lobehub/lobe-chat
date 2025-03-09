import { GlobalState, initialState } from '@/store/global/initialState';
import { merge } from '@/utils/merge';

import { systemStatusSelectors } from './systemStatus';

describe('settingsSelectors', () => {
  describe('currentThemeMode', () => {
    it('should return the correct theme', () => {
      const s: GlobalState = merge(initialState, {
        status: {
          themeMode: 'light',
        },
      });

      const result = systemStatusSelectors.themeMode(s);

      expect(result).toBe('light');
    });
    it('should return the auto if not set the themeMode', () => {
      const s: GlobalState = merge(initialState, {
        status: {
          themeMode: undefined,
        },
      });
      const result = systemStatusSelectors.themeMode(s);

      expect(result).toBe('auto');
    });
  });
});
