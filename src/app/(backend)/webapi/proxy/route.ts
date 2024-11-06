import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { RequestFilteringAgentOptions, useAgent as ssrfAgent } from 'request-filtering-agent';

/**
 * just for a proxy
 */
export const POST = async (req: Request) => {
  const url = await req.text();

  try {
    // https://www.npmjs.com/package/request-filtering-agent
    const options: RequestFilteringAgentOptions = {
      allowIPAddressList: process.env.SSRF_ALLOW_IP_ADDRESS_LIST?.split(',') || [],
      allowMetaIPAddress: process.env.SSRF_ALLOW_META_IP_ADDRESS?.toLowerCase() === 'true',
      allowPrivateIPAddress: process.env.SSRF_ALLOW_PRIVATE_IP_ADDRESS?.toLowerCase() === 'true',
      denyIPAddressList: process.env.SSRF_DENY_IP_ADDRESS_LIST?.split(',') || [],
    };
    const res = await fetch(url, { agent: ssrfAgent(url, options) });

    return new Response(await res.arrayBuffer(), { headers: { ...res.headers } });
  } catch (err) {
    console.error(err); // DNS lookup 127.0.0.1(family:4, host:127.0.0.1.nip.io) is not allowed. Because, It is private IP address.
    return NextResponse.json({ error: 'Not support internal host proxy' }, { status: 400 });
  }
};
