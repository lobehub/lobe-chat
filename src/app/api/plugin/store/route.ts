import { DEFAULT_LANG } from '@/const/locale';

import { PluginStore } from './Store';

export const runtime = 'edge';

export const GET = async (req: Request) => {
  const locale = new URL(req.url).searchParams.get('locale');

  const pluginStore = new PluginStore();

  let res: Response;

  res = await fetch(pluginStore.getPluginIndexUrl(locale as any));

  if (res.status === 404) {
    res = await fetch(pluginStore.getPluginIndexUrl(DEFAULT_LANG));
  }

  return res;
};
