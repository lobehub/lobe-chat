import { GlobalCommonState, initialCommonState } from './slices/common/initialState';
import { GlobalPreferenceState, initialPreferenceState } from './slices/preference/initialState';
import { GlobalSettingsState, initialSettingsState } from './slices/settings/initialState';

export { SettingsTabs, SidebarTabKey } from './slices/common/initialState';

export type GlobalState = GlobalCommonState & GlobalSettingsState & GlobalPreferenceState;

export const initialState: GlobalState = {
  ...initialCommonState,
  ...initialSettingsState,
  ...initialPreferenceState,
};
