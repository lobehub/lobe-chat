import { UserAuthState, initialAuthState } from './slices/auth/initialState';
import { UserCommonState, initialCommonState } from './slices/common/initialState';
import { UserPreferenceState, initialPreferenceState } from './slices/preference/initialState';
import { UserSettingsState, initialSettingsState } from './slices/settings/initialState';

export type UserState = UserCommonState & UserSettingsState & UserPreferenceState & UserAuthState;

export const initialState: UserState = {
  ...initialCommonState,
  ...initialSettingsState,
  ...initialPreferenceState,
  ...initialAuthState,
};
