import { ThemeMode } from '@lobechat/electron-client-ipc';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { App } from '@/core/App';

import SystemController from '../SystemCtr';

// Mock logger
vi.mock('@/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  }),
}));

// Mock electron
vi.mock('electron', () => ({
  app: {
    getLocale: vi.fn(() => 'en-US'),
    getPath: vi.fn((name: string) => `/mock/path/${name}`),
  },
  nativeTheme: {
    on: vi.fn(),
    shouldUseDarkColors: false,
  },
  shell: {
    openExternal: vi.fn().mockResolvedValue(undefined),
  },
  systemPreferences: {
    isTrustedAccessibilityClient: vi.fn(() => true),
  },
}));

// Mock electron-is
vi.mock('electron-is', () => ({
  macOS: vi.fn(() => true),
}));

// Mock node:fs
vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

// Mock @/const/dir
vi.mock('@/const/dir', () => ({
  DB_SCHEMA_HASH_FILENAME: 'db-schema-hash.txt',
  LOCAL_DATABASE_DIR: 'database',
  userDataDir: '/mock/user/data',
}));

// Mock browserManager
const mockBrowserManager = {
  broadcastToAllWindows: vi.fn(),
  handleAppThemeChange: vi.fn(),
};

// Mock storeManager
const mockStoreManager = {
  get: vi.fn(),
  set: vi.fn(),
};

// Mock i18n
const mockI18n = {
  changeLanguage: vi.fn().mockResolvedValue(undefined),
};

const mockApp = {
  appStoragePath: '/mock/storage',
  browserManager: mockBrowserManager,
  i18n: mockI18n,
  storeManager: mockStoreManager,
} as unknown as App;

describe('SystemController', () => {
  let controller: SystemController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new SystemController(mockApp);
  });

  describe('getAppState', () => {
    it('should return app state with system info', async () => {
      const result = await controller.getAppState();

      expect(result).toMatchObject({
        arch: expect.any(String),
        platform: expect.any(String),
        systemAppearance: 'light',
        userPath: {
          desktop: '/mock/path/desktop',
          documents: '/mock/path/documents',
          downloads: '/mock/path/downloads',
          home: '/mock/path/home',
          music: '/mock/path/music',
          pictures: '/mock/path/pictures',
          userData: '/mock/path/userData',
          videos: '/mock/path/videos',
        },
      });
    });

    it('should return dark appearance when nativeTheme is dark', async () => {
      const { nativeTheme } = await import('electron');
      Object.defineProperty(nativeTheme, 'shouldUseDarkColors', { value: true });

      const result = await controller.getAppState();

      expect(result.systemAppearance).toBe('dark');

      // Reset
      Object.defineProperty(nativeTheme, 'shouldUseDarkColors', { value: false });
    });
  });

  describe('checkAccessibilityForMacOS', () => {
    it('should check accessibility on macOS', async () => {
      const { systemPreferences } = await import('electron');

      controller.checkAccessibilityForMacOS();

      expect(systemPreferences.isTrustedAccessibilityClient).toHaveBeenCalledWith(true);
    });

    it('should return undefined on non-macOS', async () => {
      const { macOS } = await import('electron-is');
      vi.mocked(macOS).mockReturnValue(false);

      const result = controller.checkAccessibilityForMacOS();

      expect(result).toBeUndefined();

      // Reset
      vi.mocked(macOS).mockReturnValue(true);
    });
  });

  describe('openExternalLink', () => {
    it('should open external link', async () => {
      const { shell } = await import('electron');

      await controller.openExternalLink('https://example.com');

      expect(shell.openExternal).toHaveBeenCalledWith('https://example.com');
    });
  });

  describe('updateLocale', () => {
    it('should update locale and broadcast change', async () => {
      const result = await controller.updateLocale('zh-CN');

      expect(mockStoreManager.set).toHaveBeenCalledWith('locale', 'zh-CN');
      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('zh-CN');
      expect(mockBrowserManager.broadcastToAllWindows).toHaveBeenCalledWith('localeChanged', {
        locale: 'zh-CN',
      });
      expect(result).toEqual({ success: true });
    });

    it('should use system locale when set to auto', async () => {
      await controller.updateLocale('auto');

      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('en-US');
    });
  });

  describe('updateThemeModeHandler', () => {
    it('should update theme mode and broadcast change', async () => {
      const themeMode: ThemeMode = 'dark';

      await controller.updateThemeModeHandler(themeMode);

      expect(mockStoreManager.set).toHaveBeenCalledWith('themeMode', 'dark');
      expect(mockBrowserManager.broadcastToAllWindows).toHaveBeenCalledWith('themeChanged', {
        themeMode: 'dark',
      });
      expect(mockBrowserManager.handleAppThemeChange).toHaveBeenCalled();
    });
  });

  describe('getDatabasePath', () => {
    it('should return database path', async () => {
      const result = await controller.getDatabasePath();

      expect(result).toBe('/mock/storage/database');
    });
  });

  describe('getDatabaseSchemaHash', () => {
    it('should return schema hash when file exists', async () => {
      const { readFileSync } = await import('node:fs');
      vi.mocked(readFileSync).mockReturnValue('abc123');

      const result = await controller.getDatabaseSchemaHash();

      expect(result).toBe('abc123');
    });

    it('should return undefined when file does not exist', async () => {
      const { readFileSync } = await import('node:fs');
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = await controller.getDatabaseSchemaHash();

      expect(result).toBeUndefined();
    });
  });

  describe('getUserDataPath', () => {
    it('should return user data path', async () => {
      const result = await controller.getUserDataPath();

      expect(result).toBe('/mock/user/data');
    });
  });

  describe('setDatabaseSchemaHash', () => {
    it('should write schema hash to file', async () => {
      const { writeFileSync } = await import('node:fs');

      await controller.setDatabaseSchemaHash('newhash123');

      expect(writeFileSync).toHaveBeenCalledWith(
        '/mock/storage/db-schema-hash.txt',
        'newhash123',
        'utf8',
      );
    });
  });

  describe('afterAppReady', () => {
    it('should initialize system theme listener', async () => {
      const { nativeTheme } = await import('electron');

      controller.afterAppReady();

      expect(nativeTheme.on).toHaveBeenCalledWith('updated', expect.any(Function));
    });

    it('should not initialize listener twice', async () => {
      const { nativeTheme } = await import('electron');

      controller.afterAppReady();
      controller.afterAppReady();

      // Should only be called once
      expect(nativeTheme.on).toHaveBeenCalledTimes(1);
    });

    it('should broadcast system theme change when theme updates', async () => {
      const { nativeTheme } = await import('electron');

      controller.afterAppReady();

      // Get the callback that was registered
      const callback = vi.mocked(nativeTheme.on).mock.calls[0][1] as () => void;

      // Simulate theme change to dark
      Object.defineProperty(nativeTheme, 'shouldUseDarkColors', { value: true });
      callback();

      expect(mockBrowserManager.broadcastToAllWindows).toHaveBeenCalledWith('systemThemeChanged', {
        themeMode: 'dark',
      });

      // Reset
      Object.defineProperty(nativeTheme, 'shouldUseDarkColors', { value: false });
    });
  });
});
