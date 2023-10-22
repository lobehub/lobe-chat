import { getPluginIndexJSON } from '@/const/url';
import { getCurrentLanguage } from '@/store/global/helpers';

/**
 * fetch Plugin Market List
 */
export const getPluginList = async () => {
  const url = getPluginIndexJSON(getCurrentLanguage());

  const res = await fetch(url);

  return res.json();
};
