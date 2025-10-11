import { MarketSDK } from '@lobehub/market-sdk';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{
    segments?: string[];
  }>;
};

const MARKET_BASE_URL = process.env.NEXT_PUBLIC_MARKET_BASE_URL || 'http://127.0.0.1:8787';

const extractAccessToken = (req: NextRequest) => {
  const authorization = req.headers.get('authorization');
  if (!authorization) return undefined;

  const [scheme, token] = authorization.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return undefined;

  return token;
};

const methodNotAllowed = (methods: string[]) =>
  NextResponse.json(
    {
      error: 'method_not_allowed',
      message: `Allowed methods: ${methods.join(', ')}`,
      status: 'error',
    },
    {
      headers: { Allow: methods.join(', ') },
      status: 405,
    },
  );

const notFound = (reason: string) =>
  NextResponse.json(
    {
      error: 'not_found',
      message: reason,
      status: 'error',
    },
    { status: 404 },
  );

const handleAgents = async (req: NextRequest, segments: string[]) => {
  const accessToken = extractAccessToken(req);
  const market = new MarketSDK({
    accessToken,
    baseURL: MARKET_BASE_URL,
  });

  if (segments.length >= 2) {
    const subPath = segments[1];

    if (subPath === 'create') {
      if (req.method !== 'POST') return methodNotAllowed(['POST']);

      try {
        const payload = await req.json();
        const response = await market.agents.createAgent(payload);
        return NextResponse.json(response);
      } catch (error) {
        console.error('[Market] Failed to create agent:', error);
        return NextResponse.json(
          {
            error: 'create_agent_failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            status: 'error',
          },
          { status: 500 },
        );
      }
    }

    if (segments.length === 3 && subPath === 'versions' && segments[2] === 'create') {
      if (req.method !== 'POST') return methodNotAllowed(['POST']);

      try {
        const payload = await req.json();
        if (typeof payload !== 'object' || payload === null) {
          return NextResponse.json(
            {
              error: 'invalid_payload',
              message: 'Request body must be a JSON object.',
              status: 'error',
            },
            { status: 400 },
          );
        }

        const identifier = (payload as { identifier?: string }).identifier;
        if (!identifier) {
          return NextResponse.json(
            {
              error: 'missing_identifier',
              message: 'Identifier is required to create agent version.',
              status: 'error',
            },
            { status: 400 },
          );
        }

        const response = await market.agents.createAgentVersion(payload);
        return NextResponse.json(response);
      } catch (error) {
        console.error('[Market] Failed to create agent version:', error);
        return NextResponse.json(
          {
            error: 'create_agent_version_failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            status: 'error',
          },
          { status: 500 },
        );
      }
    }

    if (segments.length === 2 && subPath !== 'versions') {
      if (req.method !== 'GET') return methodNotAllowed(['GET']);

      try {
        const response = await market.agents.getAgentDetail(subPath);
        return NextResponse.json(response);
      } catch (error) {
        console.error('[Market] Failed to get agent detail:', error);
        return NextResponse.json(
          {
            error: 'get_agent_detail_failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            status: 'error',
          },
          { status: 500 },
        );
      }
    }

    return notFound('Requested agent endpoint is not available.');
  }

  return notFound('Requested agent endpoint is not available.');
};

const handleProxy = async (req: NextRequest, context: RouteContext) => {
  const { segments } = await context.params;
  const normalizedSegments = segments?.map((segment) => decodeURIComponent(segment)) ?? [];

  if (normalizedSegments.length === 0) {
    return notFound('Missing endpoint.');
  }

  const resource = normalizedSegments[0];

  switch (resource) {
    case 'agents': {
      return handleAgents(req, normalizedSegments);
    }

    default: {
      return notFound(`Unknown resource: ${resource}`);
    }
  }
};

export const GET = (req: NextRequest, context: RouteContext) => handleProxy(req, context);
export const POST = (req: NextRequest, context: RouteContext) => handleProxy(req, context);

export const dynamic = 'force-dynamic';
