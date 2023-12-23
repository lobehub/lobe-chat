import { DEFAULT_LANG } from '@/const/locale';

import { AgentMarket } from './AgentMarket';

export const runtime = 'edge';

export const GET = async (req: Request) => {
  const locale = new URL(req.url).searchParams.get('locale');

  const market = new AgentMarket();

  let res: Response;

  res = await fetch(market.getAgentIndexUrl(locale as any));

  if (res.status === 404) {
    res = await fetch(market.getAgentIndexUrl(DEFAULT_LANG));
  }

  return res;
};
