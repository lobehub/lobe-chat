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
  allowMultipleInstances: boolean;
  // Include common BrowserWindow options
  autoHideMenuBar?: boolean;
  baseIdentifier: string;
  basePath: string;
  devTools?: boolean;
  height?: number;
  keepAlive?: boolean;
  minWidth?: number;
  parentIdentifier?: string;
  showOnInit?: boolean;
  title?: string;
  titleBarStyle?: 'hidden' | 'default' | 'hiddenInset' | 'customButtonsOnHover';
  vibrancy?:
    | 'appearance-based'
    | 'content'
    | 'fullscreen-ui'
    | 'header'
    | 'hud'
    | 'menu'
    | 'popover'
    | 'selection'
    | 'sheet'
    | 'sidebar'
    | 'titlebar'
    | 'tooltip'
    | 'under-page'
    | 'under-window'
    | 'window';
  width?: number;
}

export const windowTemplates = {
  chatSingle: {
    allowMultipleInstances: true,
    autoHideMenuBar: true,
    baseIdentifier: 'chatSingle',
    basePath: '/chat',
    height: 600,
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
