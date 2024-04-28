import { settingsSelectors } from './slices/settings/selectors';
import { useUserStore } from './store';

const getCurrentLanguage = () => settingsSelectors.currentLanguage(useUserStore.getState());

export const globalHelpers = {
  getCurrentLanguage,
};
