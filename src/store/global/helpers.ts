import { settingsSelectors } from './selectors';
import { useGlobalStore } from './store';

export const getCurrentLanguage = () =>
  settingsSelectors.currentLanguage(useGlobalStore.getState());
