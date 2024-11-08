import { UserStore } from '@/store/user';
import { UserState, initialState } from '@/store/user/initialState';
import { merge } from '@/utils/merge';

import { userGeneralSettingsSelectors } from './general';

describe('settingsSelectors', () => {
  describe('currentLanguage', () => {
    it('should return the correct language setting', () => {
      const s: UserState = merge(initialState, {
        settings: {
          general: { language: 'fr' },
        },
      });

      const result = userGeneralSettingsSelectors.currentLanguage(s as UserStore);

      expect(result).toBe('fr');
    });
  });

  describe('currentThemeMode', () => {
    it('should return the correct theme', () => {
      const s: UserState = merge(initialState, {
        settings: {
          general: { themeMode: 'light' },
        },
      });

      const result = userGeneralSettingsSelectors.currentThemeMode(s as UserStore);

      expect(result).toBe('light');
    });
    it('should return the auto if not set the themeMode', () => {
      const s: UserState = merge(initialState, {
        settings: {
          general: { themeMode: undefined },
        },
      });
      const result = userGeneralSettingsSelectors.currentThemeMode(s as UserStore);

      expect(result).toBe('auto');
    });
  });
});
