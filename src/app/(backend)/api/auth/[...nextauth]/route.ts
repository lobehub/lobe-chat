import { NextRequest } from 'next/server';

import { appEnv } from '@/config/app';
import NextAuthNode from '@/libs/next-auth';

function rewriteRequest(req: NextRequest) {
  const {
    headers,
    nextUrl: { protocol, host, pathname, search },
  } = req;

  const detectedHost = headers.get('x-forwarded-host') ?? host;
  const detectedProtocol = headers.get('x-forwarded-proto') ?? protocol;
  const _protocol = `${detectedProtocol.replace(/:$/, '')}:`;
  const url = new URL(
    _protocol + '//' + detectedHost + appEnv.NEXT_PUBLIC_BASE_PATH + pathname + search,
  );

  return new NextRequest(url, req);
}
export const GET = async (req: NextRequest) => await NextAuthNode.handlers.GET(rewriteRequest(req));
export const POST = async (req: NextRequest) =>
  await NextAuthNode.handlers.POST(rewriteRequest(req));
