import type { BrowserWindowOpts } from './core/Browser';

export const BrowsersIdentifiers = {
  chat: 'chat',
  devtools: 'devtools',
  settings: 'settings',
};

export const appBrowsers = {
  chat: {
    autoHideMenuBar: true,
    height: 800,
    identifier: 'chat',
    keepAlive: true,
    minWidth: 400,
    path: '/chat',
    showOnInit: true,
    titleBarStyle: 'hidden',
    vibrancy: 'under-window',
    width: 1200,
  },
  devtools: {
    autoHideMenuBar: true,
    fullscreenable: false,
    height: 600,
    identifier: 'devtools',
    maximizable: false,
    minWidth: 400,
    parentIdentifier: 'chat',
    path: '/desktop/devtools',
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    width: 1000,
  },
  settings: {
    autoHideMenuBar: true,
    height: 800,
    identifier: 'settings',
    keepAlive: true,
    minWidth: 600,
    parentIdentifier: 'chat',
    path: '/settings',
    titleBarStyle: 'hidden',
    vibrancy: 'under-window',
    width: 1000,
  },
} satisfies Record<string, BrowserWindowOpts>;

export type AppBrowsersIdentifiers = keyof typeof appBrowsers;
