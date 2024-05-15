import { DEFAULT_PREFERENCE } from '@/const/user';
import { UserPreference } from '@/types/user';
import { AsyncLocalStorage } from '@/utils/localStorage';

export interface UserPreferenceState {
  isPreferenceInit: boolean;
  /**
   * the user preference, which only store in local storage
   */
  preference: UserPreference;
  preferenceStorage: AsyncLocalStorage<UserPreference>;
}

export const initialPreferenceState: UserPreferenceState = {
  isPreferenceInit: false,
  preference: DEFAULT_PREFERENCE,
  preferenceStorage: new AsyncLocalStorage('LOBE_PREFERENCE'),
};
