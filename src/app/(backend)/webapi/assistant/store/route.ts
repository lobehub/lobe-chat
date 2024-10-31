import { NextResponse } from 'next/server';

import { DEFAULT_LANG } from '@/const/locale';
import { AssistantStore } from '@/server/modules/AssistantStore';

export const runtime = 'edge';

export const GET = async (req: Request) => {
  try {
    const locale = new URL(req.url).searchParams.get('locale');

    const market = new AssistantStore();

    let res: Response;

    res = await fetch(market.getAgentIndexUrl(locale as any));

    if (res.status === 404) {
      res = await fetch(market.getAgentIndexUrl(DEFAULT_LANG));
    }

    const data = await res.json();
    return NextResponse.json(data);
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
