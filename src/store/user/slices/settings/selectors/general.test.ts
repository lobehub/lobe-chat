import { UserStore } from '../../../store';
import { userGeneralSettingsSelectors } from './general';

describe('settingsSelectors', () => {
  describe('currentLanguage', () => {
    it('should return the correct language setting', () => {
      const s = {
        settings: {
          language: 'fr',
        },
      } as unknown as UserStore;

      const result = userGeneralSettingsSelectors.currentLanguage(s);

      expect(result).toBe('fr');
    });
  });

  describe('currentThemeMode', () => {
    it('should return the correct theme', () => {
      const s = {
        settings: {
          themeMode: 'light',
        },
      } as unknown as UserStore;

      const result = userGeneralSettingsSelectors.currentThemeMode(s);

      expect(result).toBe('light');
    });
    it('should return the auto if not set the themeMode', () => {
      const s = {
        settings: {
          themeMode: undefined,
        },
      } as unknown as UserStore;

      const result = userGeneralSettingsSelectors.currentThemeMode(s);

      expect(result).toBe('auto');
    });
  });
});
