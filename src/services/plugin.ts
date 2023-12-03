import { LobeChatPluginsMarketIndex } from '@lobehub/chat-plugin-sdk';

import { getPluginIndexJSON } from '@/const/url';
import { getCurrentLanguage } from '@/store/global/helpers';

class PluginService {
  /**
   * get plugin list from store
   */
  getPluginList = async () => {
    const url = getPluginIndexJSON(getCurrentLanguage());

    const res = await fetch(url);

    const data: LobeChatPluginsMarketIndex = await res.json();

    return data;
  };
}

export const pluginService = new PluginService();
