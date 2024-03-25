import { NextResponse } from 'next/server';

import { getServerConfig } from '@/config/server';
import { DEFAULT_LANG } from '@/const/locale';
import { LobeChatAgentsMarketIndex } from '@/types/market';

import { AgentMarket } from './AgentMarket';

export const runtime = 'edge';

export const GET = async (req: Request) => {
  const locale = new URL(req.url).searchParams.get('locale');

  const marketBaseUrls = getServerConfig().AGENTS_INDEX_URL.split(',');

  let marketIndex: LobeChatAgentsMarketIndex = {
    agents: [],
    schemaVersion: 1,
    tags: [],
  };
  for (const [index, baseUrl] of marketBaseUrls.entries()) {
    const market = new AgentMarket(baseUrl);
    let res: Response;
    res = await fetch(market.getAgentIndexUrl(locale as any));

    if (res.status === 404) {
      res = await fetch(market.getAgentIndexUrl(DEFAULT_LANG));
    }

    if (res.status !== 200) {
      continue;
    }

    const data: LobeChatAgentsMarketIndex = await res.json();
    marketIndex.tags = marketIndex.tags.concat(data.tags);
    for (const agent of data.agents) {
      agent.marketId = index;
      marketIndex.agents.push(agent);
    }
  }

  return NextResponse.json(marketIndex);
};
