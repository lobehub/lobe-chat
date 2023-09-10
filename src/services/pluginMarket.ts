import { getPluginIndexJSON } from '@/const/url';
import { useGlobalStore } from '@/store/global';

/**
 * fetch Plugin Market List
 */
export const getPluginList = async () => {
  const url = getPluginIndexJSON(useGlobalStore.getState().settings.language);

  const res = await fetch(url);

  return res.json();
};
