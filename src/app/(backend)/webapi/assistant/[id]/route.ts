import { DEFAULT_LANG } from '@/const/locale';
import { AssistantStore } from '@/server/modules/AssistantStore';

export const runtime = 'edge';

type Params = Promise<{ id: string }>;

export const GET = async (req: Request, segmentData: { params: Params }) => {
  const params = await segmentData.params;

  const { searchParams } = new URL(req.url);

  const locale = searchParams.get('locale');

  const market = new AssistantStore();

  let res: Response;

  res = await fetch(market.getAgentUrl(params.id, locale as any));
  if (res.status === 404) {
    res = await fetch(market.getAgentUrl(params.id, DEFAULT_LANG));
  }

  return res;
};
