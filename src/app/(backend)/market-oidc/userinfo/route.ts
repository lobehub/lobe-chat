import { NextRequest, NextResponse } from 'next/server';

const MARKET_BASE_URL = process.env.NEXT_PUBLIC_MARKET_BASE_URL || 'http://127.0.0.1:8787';

const forwardHeaders = (response: Response) => {
  const headers = new Headers();

  const contentType = response.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  const cacheControl = response.headers.get('cache-control');
  if (cacheControl) headers.set('cache-control', cacheControl);
  const pragma = response.headers.get('pragma');
  if (pragma) headers.set('pragma', pragma);
  const expires = response.headers.get('expires');
  if (expires) headers.set('expires', expires);

  return headers;
};

export const POST = async (req: NextRequest) => {
  try {
    const targetUrl = `${MARKET_BASE_URL.replace(/\/$/, '')}/market-oidc/userinfo`;
    const { token } = await req.json();
    const upstreamResponse = await fetch(targetUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    console.log('[MarketOIDC] Userinfo request:', targetUrl, {
      headers: {
        ...req.headers,
      },
      method: 'GET',
    });

    const body = await upstreamResponse.text();
    const headers = forwardHeaders(upstreamResponse);

    return new NextResponse(body, {
      headers,
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'userinfo_proxy_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
      },
      { status: 500 },
    );
  }
};

export const dynamic = 'force-dynamic';
