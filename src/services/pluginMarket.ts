import { getPluginIndexJSON } from '@/const/url';
import { settingsSelectors, useGlobalStore } from '@/store/global';

/**
 * fetch Plugin Market List
 */
export const getPluginList = async () => {
  const url = getPluginIndexJSON(settingsSelectors.currentLanguage(useGlobalStore.getState()));

  const res = await fetch(url);

  return res.json();
};
