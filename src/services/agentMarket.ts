import { getAgentIndexJSON } from '@/const/url';
import { useGlobalStore } from '@/store/global';

/**
 * 请求助手列表
 */
export const getAgentList = async () => {
  const res = await fetch(getAgentIndexJSON(useGlobalStore.getState().settings.language));

  return res.json();
};

/**
 * 请求助手 manifest
 */
export const getAgentManifest = async (manifestUrl: string) => {
  const res = await fetch(manifestUrl);

  return res.json();
};
