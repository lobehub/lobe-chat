import { DEFAULT_PREFERENCE } from '@/const/user';
import { UserPreference } from '@/types/user';

export interface UserPreferenceState {
  isUserStateInit: boolean;
  /**
   * the user preference, which only store in local storage
   */
  preference: UserPreference;
}

export const initialPreferenceState: UserPreferenceState = {
  isUserStateInit: false,
  preference: DEFAULT_PREFERENCE,
};
