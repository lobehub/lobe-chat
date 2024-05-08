import { AsyncLocalStorage } from '@/utils/localStorage';

export interface Guide {
  /**
   * Move the settings button to the avatar dropdown
   */
  moveSettingsToAvatar?: boolean;

  // Topic 引导
  topic?: boolean;
}

export interface UserPreference {
  guide?: Guide;
  hideSyncAlert?: boolean;
  telemetry: boolean | null;
  /**
   * whether to use cmd + enter to send message
   */
  useCmdEnterToSend?: boolean;
}

export interface UserPreferenceState {
  isPreferenceInit: boolean;
  /**
   * the user preference, which only store in local storage
   */
  preference: UserPreference;
  preferenceStorage: AsyncLocalStorage<UserPreference>;
}

export const DEFAULT_PREFERENCE: UserPreference = {
  guide: {
    moveSettingsToAvatar: true,
  },
  telemetry: null,
  useCmdEnterToSend: false,
};

export const initialPreferenceState: UserPreferenceState = {
  isPreferenceInit: false,
  preference: DEFAULT_PREFERENCE,
  preferenceStorage: new AsyncLocalStorage('LOBE_PREFERENCE'),
};
