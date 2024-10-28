import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { useAgent as ssrfAgent } from 'request-filtering-agent';

/**
 * just for a proxy
 */
export const POST = async (req: Request) => {
  const url = await req.text();

  try {
    const res = await fetch(url, { agent: ssrfAgent(url) });

    return new Response(await res.arrayBuffer(), { headers: { ...res.headers } });
  } catch (err) {
    console.error(err); // DNS lookup 127.0.0.1(family:4, host:127.0.0.1.nip.io) is not allowed. Because, It is private IP address.
    return NextResponse.json({ error: 'Not support internal host proxy' }, { status: 400 });
  }
};
