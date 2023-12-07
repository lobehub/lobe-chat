import { settingsSelectors } from './selectors';
import { useGlobalStore } from './store';

const getCurrentLanguage = () => settingsSelectors.currentLanguage(useGlobalStore.getState());

export const globalHelpers = {
  getCurrentLanguage,
};
