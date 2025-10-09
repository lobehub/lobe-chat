import { NextRequest, NextResponse } from 'next/server';

const MARKET_BASE_URL = process.env.NEXT_PUBLIC_MARKET_BASE_URL || 'http://127.0.0.1:8787';

const buildTargetUrl = (req: NextRequest) => {
  const target = new URL('/market-oidc/handoff', MARKET_BASE_URL);

  req.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  return target.toString();
};

const forwardHeaders = (response: Response) => {
  const headers = new Headers();

  const contentType = response.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  // Propagate cache directives to keep behaviour consistent with upstream
  const cacheControl = response.headers.get('cache-control');
  if (cacheControl) headers.set('cache-control', cacheControl);
  const pragma = response.headers.get('pragma');
  if (pragma) headers.set('pragma', pragma);
  const expires = response.headers.get('expires');
  if (expires) headers.set('expires', expires);

  return headers;
};

export const GET = async (req: NextRequest) => {
  try {
    const targetUrl = buildTargetUrl(req);
    const upstreamResponse = await fetch(targetUrl, {
      cache: 'no-store',
    });

    console.log('[MarketOIDC] Upstream response:', upstreamResponse);

    const body = await upstreamResponse.text();

    console.log('[MarketOIDC] Body:', body);

    const headers = forwardHeaders(upstreamResponse);

    return new NextResponse(body, {
      headers,
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
    });
  } catch (error) {
    console.error('[MarketOIDC] Failed to proxy handoff request:', error);
    return NextResponse.json(
      {
        error: 'handoff_proxy_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
      },
      { status: 500 },
    );
  }
};

export const dynamic = 'force-dynamic';
