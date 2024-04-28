import { AsyncLocalStorage } from '@/utils/localStorage';

export interface Guide {
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
  /**
   * the user preference, which only store in local storage
   */
  preference: UserPreference;
  preferenceStorage: AsyncLocalStorage<UserPreference>;
}

export const initialPreferenceState: UserPreferenceState = {
  preference: {
    guide: {},
    telemetry: null,
    useCmdEnterToSend: false,
  },
  preferenceStorage: new AsyncLocalStorage('LOBE_PREFERENCE'),
};
