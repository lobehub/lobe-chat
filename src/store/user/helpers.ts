import { userGeneralSettingsSelectors } from './slices/settings/selectors';
import { useUserStore } from './store';

const getCurrentLanguage = () =>
  userGeneralSettingsSelectors.currentLanguage(useUserStore.getState());

export const globalHelpers = {
  getCurrentLanguage,
};
