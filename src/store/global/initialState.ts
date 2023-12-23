import { GlobalCommonState, initialCommonState } from './slices/common/initialState';
import { GlobalSettingsState, initialSettingsState } from './slices/settings/initialState';

export { SettingsTabs, SidebarTabKey } from './slices/common/initialState';

export type GlobalState = GlobalCommonState & GlobalSettingsState;

export const initialState: GlobalState = {
  ...initialCommonState,
  ...initialSettingsState,
};
