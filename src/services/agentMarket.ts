import { getAgentIndexJSON, getAgentJSON } from '@/const/url';
import { settingsSelectors, useGlobalStore } from '@/store/global';
import { LobeChatAgentsMarketIndex } from '@/types/market';

/**
 * 请求助手列表
 */
export const getAgentList = async () => {
  const res = await fetch(
    getAgentIndexJSON(settingsSelectors.currentLanguage(useGlobalStore.getState())),
  );

  const data: LobeChatAgentsMarketIndex = await res.json();

  return data;
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
