import { ElectronAppState, ThemeAppearance, ThemeMode } from '../types';

export interface SystemDispatchEvents {
  checkSystemAccessibility: () => boolean | undefined;
  closeWindow: () => void;
  getDesktopAppState: () => ElectronAppState;
  maximizeWindow: () => void;
  minimizeWindow: () => void;
  openExternalLink: (url: string) => void;
  /**
   * Update application language settings
   * @param locale Language setting
   */
  updateLocale: (locale: string) => { success: boolean };
  updateThemeMode: (themeMode: ThemeMode) => void;
}

export interface SystemBroadcastEvents {
  localeChanged: (data: { locale: string }) => void;
  systemThemeChanged: (data: { themeMode: ThemeAppearance }) => void;
  themeChanged: (data: { themeMode: ThemeMode }) => void;
}
