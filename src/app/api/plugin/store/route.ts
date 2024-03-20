import { LobeChatPluginsMarketIndex } from '@lobehub/chat-plugin-sdk';
import { NextResponse } from 'next/server';

import { getServerConfig } from '@/config/server';
import { DEFAULT_LANG } from '@/const/locale';

import { PluginStore } from './Store';

export const runtime = 'edge';

export const GET = async (req: Request) => {
  const locale = new URL(req.url).searchParams.get('locale');

  const pluginBaseUrls = getServerConfig().PLUGINS_INDEX_URL.split(',');
  let pluginIndex: LobeChatPluginsMarketIndex = {
    plugins: [],
    schemaVersion: 1,
  };
  for (const baseUrl of pluginBaseUrls) {
    const pluginStore = new PluginStore(baseUrl);
    let res: Response;
    res = await fetch(pluginStore.getPluginIndexUrl(locale as any));

    if (res.status === 404) {
      res = await fetch(pluginStore.getPluginIndexUrl(DEFAULT_LANG));
    }

    if (res.status !== 200) {
      continue;
    }

    const data: LobeChatPluginsMarketIndex = await res.json();
    pluginIndex.plugins = pluginIndex.plugins.concat(data.plugins);
  }

  return NextResponse.json(pluginIndex);
};
