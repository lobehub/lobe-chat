import { CommonState, initialCommonState } from './slices/common/initialState';
import { UserSettingsState, initialSettingsState } from './slices/settings/initialState';

export type UserState = UserSettingsState & CommonState;

export const initialState: UserState = {
  ...initialSettingsState,
  ...initialCommonState,
};
