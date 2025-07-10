import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { RequestFilteringAgentOptions, useAgent as ssrfAgent } from 'request-filtering-agent';

import { appEnv } from '@/envs/app';

/**
 * just for a proxy
 */
export const POST = async (req: Request) => {
  const url = await req.text();

  try {
    // https://www.npmjs.com/package/request-filtering-agent
    const options: RequestFilteringAgentOptions = {
      allowIPAddressList: appEnv.SSRF_ALLOW_IP_ADDRESS_LIST?.split(',') || [],
      allowMetaIPAddress: appEnv.SSRF_ALLOW_PRIVATE_IP_ADDRESS,
      allowPrivateIPAddress: appEnv.SSRF_ALLOW_PRIVATE_IP_ADDRESS,
      denyIPAddressList: [],
    };
    const res = await fetch(url, { agent: ssrfAgent(url, options) });

    return new Response(await res.arrayBuffer(), { headers: { ...res.headers } });
  } catch (err) {
    console.error(err); // DNS lookup 127.0.0.1(family:4, host:127.0.0.1.nip.io) is not allowed. Because, It is private IP address.
    return NextResponse.json({ error: 'Not support internal host proxy' }, { status: 400 });
  }
};
