import { UserAuthState, initialAuthState } from './slices/auth/initialState';
import { CommonState, initialCommonState } from './slices/common/initialState';
import { ModelListState, initialModelListState } from './slices/modelList/initialState';
import { UserPreferenceState, initialPreferenceState } from './slices/preference/initialState';
import { UserSettingsState, initialSettingsState } from './slices/settings/initialState';
import { UserSyncState, initialSyncState } from './slices/sync/initialState';

export type UserState = UserSyncState &
  UserSettingsState &
  UserPreferenceState &
  UserAuthState &
  ModelListState &
  CommonState;

export const initialState: UserState = {
  ...initialSyncState,
  ...initialSettingsState,
  ...initialPreferenceState,
  ...initialAuthState,
  ...initialCommonState,
  ...initialModelListState,
};
