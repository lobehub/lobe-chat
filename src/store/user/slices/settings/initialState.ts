import { DeepPartial } from 'utility-types';

import { DEFAULT_SETTINGS } from '@/const/settings';
import { GlobalSettings } from '@/types/settings';

export interface UserSettingsState {
  defaultSettings: GlobalSettings;
  settings: DeepPartial<GlobalSettings>;
}

export const initialSettingsState: UserSettingsState = {
  defaultSettings: DEFAULT_SETTINGS,
  settings: {},
};
