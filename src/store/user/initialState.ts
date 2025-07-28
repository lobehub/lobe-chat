import { UserAuthState, initialAuthState } from './slices/auth/initialState';
import { CommonState, initialCommonState } from './slices/common/initialState';
import { UserPreferenceState, initialPreferenceState } from './slices/preference/initialState';
import { UserSettingsState, initialSettingsState } from './slices/settings/initialState';

export type UserState = UserSettingsState & UserPreferenceState & UserAuthState & CommonState;

export const initialState: UserState = {
  ...initialSettingsState,
  ...initialPreferenceState,
  ...initialAuthState,
  ...initialCommonState,
};
