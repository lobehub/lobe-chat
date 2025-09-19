import type { BrowserWindowOpts } from './core/browser/Browser';

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

// Window templates for multi-instance windows
export interface WindowTemplate {
  baseIdentifier: string;
  basePath: string;
  allowMultipleInstances: boolean;
  // Include common BrowserWindow options
  autoHideMenuBar?: boolean;
  height?: number;
  keepAlive?: boolean;
  minWidth?: number;
  parentIdentifier?: string;
  titleBarStyle?: string;
  vibrancy?: string;
  width?: number;
  devTools?: boolean;
  showOnInit?: boolean;
  title?: string;
}

export const windowTemplates = {
  chatSingle: {
    autoHideMenuBar: true,
    height: 600,
    baseIdentifier: 'chatSingle',
    basePath: '/chat',
    allowMultipleInstances: true,
    keepAlive: false, // Multi-instance windows don't need to stay alive
    minWidth: 400,
    parentIdentifier: 'chat',
    titleBarStyle: 'hidden',
    vibrancy: 'under-window',
    width: 900,
  },
} satisfies Record<string, WindowTemplate>;

export type AppBrowsersIdentifiers = keyof typeof appBrowsers;
export type WindowTemplateIdentifiers = keyof typeof windowTemplates;
