import { UserAuthState, initialAuthState } from './slices/auth/initialState';
import { UserPreferenceState, initialPreferenceState } from './slices/preference/initialState';
import { UserSettingsState, initialSettingsState } from './slices/settings/initialState';
import { UserSyncState, initialSyncState } from './slices/sync/initialState';

export type UserState = UserSyncState & UserSettingsState & UserPreferenceState & UserAuthState;

export const initialState: UserState = {
  ...initialSyncState,
  ...initialSettingsState,
  ...initialPreferenceState,
  ...initialAuthState,
};
