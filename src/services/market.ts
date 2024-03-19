import { LobeChatAgentsMarketIndex } from '@/types/market';

import { API_ENDPOINTS } from './_url';

class MarketService {
  getAgentList = async (locale: string): Promise<LobeChatAgentsMarketIndex> => {
    const res = await fetch(`${API_ENDPOINTS.market}?locale=${locale}`);

    return res.json();
  };

  /**
   * 请求助手 manifest
   */
  getAgentManifest = async (identifier: string, locale: string, marketId: number = 0) => {
    if (!identifier) return;
    const res = await fetch(
      `${API_ENDPOINTS.marketItem(identifier)}?locale=${locale}&marketId=${marketId}`,
    );

    return res.json();
  };
}
export const marketService = new MarketService();
