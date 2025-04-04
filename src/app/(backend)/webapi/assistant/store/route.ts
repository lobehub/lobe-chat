import { NextResponse } from 'next/server';

import { AssistantStore } from '@/server/modules/AssistantStore';

export const runtime = 'edge';

export const GET = async (req: Request) => {
  try {
    const locale = new URL(req.url).searchParams.get('locale');

    const market = new AssistantStore();

    const data = await market.getAgentIndex(locale as any);

    return NextResponse.json(data);
  } catch (e) {
    // it means failed to fetch
    if ((e as Error).message.includes('fetch failed')) {
      return NextResponse.json([]);
    }

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
