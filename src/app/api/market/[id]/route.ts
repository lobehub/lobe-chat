import { DEFAULT_LANG } from '@/const/locale';
import { getAgentJSON } from '@/const/url';

export const runtime = 'edge';

export const GET = async (req: Request, { params }: { params: { id: string } }) => {
  const { searchParams } = new URL(req.url);

  const locale = searchParams.get('locale');

  let res: Response;

  res = await fetch(getAgentJSON(params.id, locale as any));
  if (res.status === 404) {
    res = await fetch(getAgentJSON(params.id, DEFAULT_LANG));
  }

  return res;
};
