import { URLS } from '@/services/_url';
import { LobeChatAgentsMarketIndex } from '@/types/market';

/**
 * 请求助手列表
 */
export const getAgentList = async (locale: string): Promise<LobeChatAgentsMarketIndex> => {
  const res = await fetch(`${URLS.market}?locale=${locale}`);

  return res.json();
};

/**
 * 请求助手 manifest
 */
export const getAgentManifest = async (identifier: string, locale: string) => {
  if (!identifier) return;
  const res = await fetch(`${URLS.market}/${identifier}?locale=${locale}`);

  return res.json();
};
