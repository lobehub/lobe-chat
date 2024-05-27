import { DEFAULT_PREFERENCE } from '@/const/user';
import { UserPreference } from '@/types/user';

export interface UserPreferenceState {
  /**
   * the user preference, which only store in local storage
   */
  preference: UserPreference;
}

export const initialPreferenceState: UserPreferenceState = {
  preference: DEFAULT_PREFERENCE,
};
