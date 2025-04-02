import type { BrowserWindowOpts } from './core/Browser';

export const chat: BrowserWindowOpts = {
  autoHideMenuBar: true,
  height: 800,
  identifier: 'chat',
  keepAlive: true,
  minWidth: 400,
  path: '/chat',
  titleBarStyle: 'hidden',
  vibrancy: 'under-window',
  width: 1200,
};

export const devtools: BrowserWindowOpts = {
  autoHideMenuBar: true,
  fullscreenable: false,
  height: 600,
  identifier: 'devtools',
  maximizable: false,
  minWidth: 400,
  path: '/desktop/devtools',
  titleBarStyle: 'hiddenInset',
  vibrancy: 'under-window',
  width: 1000,
};
