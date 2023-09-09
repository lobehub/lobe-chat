import { getPluginIndexJSON } from '@/const/url';
import { useGlobalStore } from '@/store/global';

/**
 * 请求插件列表
 */
export const getPluginList = async () => {
  const url = getPluginIndexJSON(useGlobalStore.getState().settings.language);

  const res = await fetch(url);

  return res.json();
};
