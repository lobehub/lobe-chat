import { getAgentJSON } from '@/const/url';
import { settingsSelectors, useGlobalStore } from '@/store/global';

/**
 * 请求助手列表
 */
export const getAgentList = async () => {
  const res = await fetch(settingsSelectors.currentLanguage(useGlobalStore.getState()));

  return res.json();
};

/**
 * 请求助手 manifest
 */
export const getAgentManifest = async (identifier?: string) => {
  if (!identifier) return;
  const res = await fetch(
    getAgentJSON(identifier, settingsSelectors.currentLanguage(useGlobalStore.getState())),
  );

  return res.json();
};
