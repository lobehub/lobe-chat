import type { PartialDeep } from 'type-fest';

import { DEFAULT_SETTINGS } from '@/const/settings';
import { UserSettings } from '@/types/user/settings';

export interface UserSettingsState {
  defaultSettings: UserSettings;
  settings: PartialDeep<UserSettings>;
  updateSettingsSignal?: AbortController;
}

export const initialSettingsState: UserSettingsState = {
  defaultSettings: DEFAULT_SETTINGS,
  settings: {},
};
