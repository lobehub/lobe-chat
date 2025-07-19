import { BrowserWindowConstructorOptions, nativeTheme } from 'electron';
import windowStateKeeper from 'electron-window-state';
import { join } from 'node:path';

import { preloadDir } from '@/const/dir';
import { DEFAULT_WINDOW_CONFIG } from '@/const/theme';

import type { BrowserWindowOpts } from '../browser/Browser';
import { WindowThemeManager } from './WindowThemeManager';

export interface WindowConfig extends BrowserWindowConstructorOptions {
  windowStateKeeper: windowStateKeeper.State;
}

export class WindowConfigBuilder {
  private options: BrowserWindowOpts;
  private windowStateKeeper: windowStateKeeper.State;

  constructor(options: BrowserWindowOpts) {
    this.options = options;
    this.initializeWindowStateKeeper();
  }

  private initializeWindowStateKeeper() {
    const { width, height } = this.options;

    this.windowStateKeeper = windowStateKeeper({
      defaultHeight: height || DEFAULT_WINDOW_CONFIG.DEFAULT_HEIGHT,
      defaultWidth: width || DEFAULT_WINDOW_CONFIG.DEFAULT_WIDTH,
      file: `window-state-${this.options.identifier}.json`,
      fullScreen: false,
      maximize: false,
    });
  }

  build(): WindowConfig {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { title, devTools, showOnInit, ...rest } = this.options;
    const isDarkMode = nativeTheme.shouldUseDarkColors;

    const baseConfig: BrowserWindowConstructorOptions = {
      ...rest,
      autoHideMenuBar: true,
      darkTheme: isDarkMode,
      frame: false,
      height: this.windowStateKeeper.height,
      minHeight: DEFAULT_WINDOW_CONFIG.MIN_HEIGHT,
      minWidth: DEFAULT_WINDOW_CONFIG.MIN_WIDTH,
      show: false,
      title,
      transparent: false,
      vibrancy: 'sidebar',
      visualEffectState: 'active',
      webPreferences: this.buildWebPreferences(),
      width: this.windowStateKeeper.width,
      x: this.windowStateKeeper.x,
      y: this.windowStateKeeper.y,
    };

    // Apply platform-specific theme configurations from WindowThemeManager
    const platformThemeConfig = WindowThemeManager.getPlatformThemeConfig(isDarkMode);
    Object.assign(baseConfig, platformThemeConfig);

    return {
      ...baseConfig,
      windowStateKeeper: this.windowStateKeeper,
    };
  }

  private buildWebPreferences() {
    return {
      allowRunningInsecureContent: true,
      backgroundThrottling: false,
      contextIsolation: true,
      preload: join(preloadDir, 'index.js'),
      sandbox: false,
      webSecurity: false,
      webviewTag: true,
    };
  }
}
