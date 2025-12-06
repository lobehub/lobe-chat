import { ThemeMode } from '@lobechat/electron-client-ipc';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { App } from '@/core/App';
import type { IpcContext } from '@/utils/ipc';
import { IpcHandler } from '@/utils/ipc/base';

import SystemController from '../SystemCtr';

const { ipcHandlers, ipcMainHandleMock } = vi.hoisted(() => {
  const handlers = new Map<string, (event: any, ...args: any[]) => any>();
  const handle = vi.fn((channel: string, handler: any) => {
    handlers.set(channel, handler);
  });
  return { ipcHandlers: handlers, ipcMainHandleMock: handle };
});

const invokeIpc = async <T = any>(
  channel: string,
  payload?: any,
  context?: Partial<IpcContext>,
): Promise<T> => {
  const handler = ipcHandlers.get(channel);
  if (!handler) throw new Error(`IPC handler for ${channel} not found`);

  const fakeEvent = {
    sender: context?.sender ?? ({ id: 'test' } as any),
  };

  if (payload === undefined) {
    return handler(fakeEvent);
  }

  return handler(fakeEvent, payload);
};

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
  ipcMain: {
    handle: ipcMainHandleMock,
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
    ipcHandlers.clear();
    ipcMainHandleMock.mockClear();
    (IpcHandler.getInstance() as any).registeredChannels?.clear();
    controller = new SystemController(mockApp);
  });

  describe('getAppState', () => {
    it('should return app state with system info', async () => {
      const result = await invokeIpc('system.getAppState');

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

      const result = await invokeIpc('system.getAppState');

      expect(result.systemAppearance).toBe('dark');

      // Reset
      Object.defineProperty(nativeTheme, 'shouldUseDarkColors', { value: false });
    });
  });

  describe('checkAccessibilityForMacOS', () => {
    it('should check accessibility on macOS', async () => {
      const { systemPreferences } = await import('electron');

      await invokeIpc('system.checkAccessibilityForMacOS');

      expect(systemPreferences.isTrustedAccessibilityClient).toHaveBeenCalledWith(true);
    });

    it('should return undefined on non-macOS', async () => {
      const { macOS } = await import('electron-is');
      vi.mocked(macOS).mockReturnValue(false);

      const result = await invokeIpc('system.checkAccessibilityForMacOS');

      expect(result).toBeUndefined();

      // Reset
      vi.mocked(macOS).mockReturnValue(true);
    });
  });

  describe('openExternalLink', () => {
    it('should open external link', async () => {
      const { shell } = await import('electron');

      await invokeIpc('system.openExternalLink', 'https://example.com');

      expect(shell.openExternal).toHaveBeenCalledWith('https://example.com');
    });
  });

  describe('updateLocale', () => {
    it('should update locale and broadcast change', async () => {
      const result = await invokeIpc('system.updateLocale', 'zh-CN');

      expect(mockStoreManager.set).toHaveBeenCalledWith('locale', 'zh-CN');
      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('zh-CN');
      expect(mockBrowserManager.broadcastToAllWindows).toHaveBeenCalledWith('localeChanged', {
        locale: 'zh-CN',
      });
      expect(result).toEqual({ success: true });
    });

    it('should use system locale when set to auto', async () => {
      await invokeIpc('system.updateLocale', 'auto');

      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('en-US');
    });
  });

  describe('updateThemeModeHandler', () => {
    it('should update theme mode and broadcast change', async () => {
      const themeMode: ThemeMode = 'dark';

      await invokeIpc('system.updateThemeModeHandler', themeMode);

      expect(mockStoreManager.set).toHaveBeenCalledWith('themeMode', 'dark');
      expect(mockBrowserManager.broadcastToAllWindows).toHaveBeenCalledWith('themeChanged', {
        themeMode: 'dark',
      });
      expect(mockBrowserManager.handleAppThemeChange).toHaveBeenCalled();
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
