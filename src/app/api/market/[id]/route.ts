import { NextResponse } from 'next/server';

import { getServerConfig } from '@/config/server';
import { DEFAULT_LANG } from '@/const/locale';
import { AgentsMarketItem } from '@/types/market';

import { AgentMarket } from '../AgentMarket';

export const runtime = 'edge';

export const GET = async (req: Request, { params }: { params: { id: string } }) => {
  const { searchParams } = new URL(req.url);

  const locale = searchParams.get('locale');
  const marketId = Number(searchParams.get('marketId')) || 0; // Convert marketId to number
  const marketBaseUrls = getServerConfig().AGENTS_INDEX_URL.split(',');

  const market = new AgentMarket(marketBaseUrls[marketId]);

  let res: Response;

  res = await fetch(market.getAgentUrl(params.id, locale as any));
  if (res.status === 404) {
    res = await fetch(market.getAgentUrl(params.id, DEFAULT_LANG));
  }

  if (res.status !== 200) {
    return res;
  }
  const data: AgentsMarketItem = await res.json();
  data.marketId = marketId;
  return NextResponse.json(data);
};
