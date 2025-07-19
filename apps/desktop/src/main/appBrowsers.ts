import { DEFAULT_WINDOW_CONFIG } from './const/theme';
import type { BrowserWindowOpts } from './core/browser/Browser';

export const BrowsersIdentifiers = {
  chat: 'chat',
  devtools: 'devtools',
  settings: 'settings',
};

export const appBrowsers = {
  chat: {
    autoHideMenuBar: true,
    height: DEFAULT_WINDOW_CONFIG.DEFAULT_HEIGHT,
    identifier: 'chat',
    keepAlive: true,
    minWidth: DEFAULT_WINDOW_CONFIG.MIN_WIDTH,
    path: '/chat',
    showOnInit: true,
    titleBarStyle: 'hidden',
    vibrancy: 'under-window',
    width: DEFAULT_WINDOW_CONFIG.DEFAULT_WIDTH,
  },
  devtools: {
    autoHideMenuBar: true,
    fullscreenable: false,
    height: DEFAULT_WINDOW_CONFIG.DEVTOOLS_WINDOW.HEIGHT,
    identifier: 'devtools',
    maximizable: false,
    minWidth: DEFAULT_WINDOW_CONFIG.MIN_WIDTH,
    parentIdentifier: 'chat',
    path: '/desktop/devtools',
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    width: DEFAULT_WINDOW_CONFIG.DEVTOOLS_WINDOW.WIDTH,
  },
  settings: {
    autoHideMenuBar: true,
    height: DEFAULT_WINDOW_CONFIG.SETTINGS_WINDOW.HEIGHT,
    identifier: 'settings',
    // keepAlive: true,
    minWidth: DEFAULT_WINDOW_CONFIG.SETTINGS_WINDOW.MIN_WIDTH,
    parentIdentifier: 'chat',
    path: '/settings',
    titleBarStyle: 'hidden',
    vibrancy: 'under-window',
    width: DEFAULT_WINDOW_CONFIG.SETTINGS_WINDOW.WIDTH,
  },
} satisfies Record<string, BrowserWindowOpts>;

export type AppBrowsersIdentifiers = keyof typeof appBrowsers;
