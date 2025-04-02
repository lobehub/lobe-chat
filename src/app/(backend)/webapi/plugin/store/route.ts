import { NextResponse } from 'next/server';

import { DEFAULT_LANG } from '@/const/locale';
import { PluginStore } from '@/server/modules/PluginStore';

export const runtime = 'edge';

export const GET = async (req: Request) => {
  try {
    const locale = new URL(req.url).searchParams.get('locale');

    const pluginStore = new PluginStore();

    let res: Response;

    res = await fetch(pluginStore.getPluginIndexUrl(locale as any));

    if (res.status === 404) {
      res = await fetch(pluginStore.getPluginIndexUrl(DEFAULT_LANG));
    }

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return res;
  } catch (e) {
    console.error(e);
    return new Response(`failed to fetch agent market index`, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      status: 500,
    });
  }
};
