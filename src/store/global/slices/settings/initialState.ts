import { DEFAULT_SETTINGS } from '@/const/settings';
import type { GlobalServerConfig, GlobalSettings } from '@/types/settings';

export interface GlobalSettingsState {
  serverConfig: GlobalServerConfig;
  /**
   * @localStorage
   */
  settings: GlobalSettings;
}

export const initialSettingsState: GlobalSettingsState = {
  serverConfig: {},
  settings: DEFAULT_SETTINGS,
};
