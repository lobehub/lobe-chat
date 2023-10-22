import { getAgentIndexJSON, getAgentJSON } from '@/const/url';
import { settingsSelectors, useGlobalStore } from '@/store/global';
import { LobeChatAgentsMarketIndex } from '@/types/market';

/**
 * 请求助手列表
 */
export const getAgentList = async () => {
  let res: Response;

  res = await fetch(
    getAgentIndexJSON(settingsSelectors.currentLanguage(useGlobalStore.getState()) as any),
  );

  if (res.status === 404) {
    res = await fetch(getAgentIndexJSON('en-US'));
  }

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
