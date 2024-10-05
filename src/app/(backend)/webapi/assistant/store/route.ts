import { DEFAULT_LANG } from '@/const/locale';
import { AssistantStore } from '@/server/modules/AssistantStore';

export const runtime = 'edge';

export const GET = async (req: Request) => {
  const locale = new URL(req.url).searchParams.get('locale');

  const market = new AssistantStore();

  let res: Response;

  res = await fetch(market.getAgentIndexUrl(locale as any));

  if (res.status === 404) {
    res = await fetch(market.getAgentIndexUrl(DEFAULT_LANG));
  }

  return res;
};
