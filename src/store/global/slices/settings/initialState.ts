import { DeepPartial } from 'utility-types';

import { DEFAULT_SETTINGS } from '@/const/settings';
import { GlobalServerConfig, GlobalSettings } from '@/types/settings';

export interface GlobalSettingsState {
  avatar?: string;
  defaultSettings: GlobalSettings;
  editingCustomCardModel?: { id: string; provider: string } | undefined;

  serverConfig: GlobalServerConfig;
  settings: DeepPartial<GlobalSettings>;
  userId?: string;
}

export const initialSettingsState: GlobalSettingsState = {
  defaultSettings: DEFAULT_SETTINGS,
  serverConfig: {
    telemetry: {},
  },
  settings: {},
};
