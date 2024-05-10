import { DeepPartial } from 'utility-types';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import { DEFAULT_SETTINGS } from '@/const/settings';
import { ModelProviderCard } from '@/types/llm';
import { GlobalServerConfig } from '@/types/serverConfig';
import { GlobalSettings } from '@/types/settings';

export interface UserSettingsState {
  defaultModelProviderList: ModelProviderCard[];
  defaultSettings: GlobalSettings;
  editingCustomCardModel?: { id: string; provider: string } | undefined;
  modelProviderList: ModelProviderCard[];
  serverConfig: GlobalServerConfig;
  settings: DeepPartial<GlobalSettings>;
}

export const initialSettingsState: UserSettingsState = {
  defaultModelProviderList: DEFAULT_MODEL_PROVIDER_LIST,
  defaultSettings: DEFAULT_SETTINGS,
  modelProviderList: DEFAULT_MODEL_PROVIDER_LIST,
  serverConfig: {
    telemetry: {},
  },
  settings: {},
};
