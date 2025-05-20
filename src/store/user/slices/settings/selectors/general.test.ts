import { UserStore } from '@/store/user';
import { UserState, initialState } from '@/store/user/initialState';
import { merge } from '@/utils/merge';

import { userGeneralSettingsSelectors } from './general';

describe('settingsSelectors', () => {
  describe('generalConfig', () => {
    it('should return general settings', () => {
      const s: UserState = merge(initialState, {
        settings: {
          general: { fontSize: 12 },
        },
      });

      const result = userGeneralSettingsSelectors.config(s as UserStore);

      expect(result).toEqual({
        fontSize: 12,
        highlighterDarkTheme: 'lobe-theme',
        highlighterLightTheme: 'lobe-theme',
        mermaidDarkTheme: 'lobe-theme',
        mermaidLightTheme: 'lobe-theme',
      });
    });
  });

  describe('fontSize', () => {
    it('should return the fontSize', () => {
      const s: UserState = merge(initialState, {
        settings: {
          general: { fontSize: 12 },
        },
      });

      const result = userGeneralSettingsSelectors.fontSize(s as UserStore);

      expect(result).toBe(12);
    });
  });

  describe('neutralColor', () => {
    it('should return undefined if general settings not exists', () => {
      const s: UserState = merge(initialState, {
        settings: {
          general: undefined,
        },
      });

      const result = userGeneralSettingsSelectors.neutralColor(s as UserStore);

      expect(result).toBeUndefined();
    });

    it('should return undefined if neutralColor not set', () => {
      const s: UserState = merge(initialState, {
        settings: {
          general: {},
        },
      });

      const result = userGeneralSettingsSelectors.neutralColor(s as UserStore);

      expect(result).toBeUndefined();
    });

    it('should return the neutralColor', () => {
      const s: UserState = merge(initialState, {
        settings: {
          general: { neutralColor: '#000000' },
        },
      });

      const result = userGeneralSettingsSelectors.neutralColor(s as UserStore);

      expect(result).toBe('#000000');
    });
  });

  describe('primaryColor', () => {
    it('should return undefined if general settings not exists', () => {
      const s: UserState = merge(initialState, {
        settings: {
          general: undefined,
        },
      });

      const result = userGeneralSettingsSelectors.primaryColor(s as UserStore);

      expect(result).toBeUndefined();
    });

    it('should return undefined if primaryColor not set', () => {
      const s: UserState = merge(initialState, {
        settings: {
          general: {},
        },
      });

      const result = userGeneralSettingsSelectors.primaryColor(s as UserStore);

      expect(result).toBeUndefined();
    });

    it('should return the primaryColor', () => {
      const s: UserState = merge(initialState, {
        settings: {
          general: { primaryColor: '#ffffff' },
        },
      });

      const result = userGeneralSettingsSelectors.primaryColor(s as UserStore);

      expect(result).toBe('#ffffff');
    });
  });

  it('should return the highlighterDarkTheme', () => {
    const s: UserState = merge(initialState, {
      settings: {
        general: { highlighterDarkTheme: 'lobe-theme' },
      },
    });

    const result = userGeneralSettingsSelectors.highlighterDarkTheme(s as UserStore);

    expect(result).toBe('lobe-theme');
  });

  it('should return the highlighterLightTheme', () => {
    const s: UserState = merge(initialState, {
      settings: {
        general: { highlighterLightTheme: 'lobe-theme' },
      },
    });

    const result = userGeneralSettingsSelectors.highlighterLightTheme(s as UserStore);

    expect(result).toBe('lobe-theme');
  });

  it('should return the mermaidDarkTheme', () => {
    const s: UserState = merge(initialState, {
      settings: {
        general: { mermaidDarkTheme: 'lobe-theme' },
      },
    });

    const result = userGeneralSettingsSelectors.mermaidDarkTheme(s as UserStore);

    expect(result).toBe('lobe-theme');
  });

  it('should return the mermaidLightTheme', () => {
    const s: UserState = merge(initialState, {
      settings: {
        general: { mermaidLightTheme: 'lobe-theme' },
      },
    });

    const result = userGeneralSettingsSelectors.mermaidLightTheme(s as UserStore);

    expect(result).toBe('lobe-theme');
  });
});
