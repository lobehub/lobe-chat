import { DEFAULT_LANG } from '@/const/locale';
import { getAgentIndexJSON } from '@/const/url';

export const runtime = 'edge';

export const GET = async (req: Request) => {
  const locale = new URL(req.url).searchParams.get('locale');

  let res: Response;

  res = await fetch(getAgentIndexJSON(locale as any));

  if (res.status === 404) {
    res = await fetch(getAgentIndexJSON(DEFAULT_LANG));
  }

  return res;
};
