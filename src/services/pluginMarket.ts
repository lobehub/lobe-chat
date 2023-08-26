import { PLUGINS_INDEX_URL } from '@/const/url';

/**
 * 请求插件列表
 */
export const getPluginList = async () => {
  const res = await fetch(PLUGINS_INDEX_URL);

  return res.json();
};
