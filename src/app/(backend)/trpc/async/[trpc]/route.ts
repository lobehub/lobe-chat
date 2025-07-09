import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import debug from 'debug';
import type { NextRequest } from 'next/server';

import { pino } from '@/libs/logger';
import { createAsyncRouteContext } from '@/libs/trpc/async/context';
import { asyncRouter } from '@/server/routers/async';

const log = debug('lobe-async:route-handler');

const handler = (req: NextRequest) => {
  log('Incoming async tRPC request: %s %s', req.method, req.url);
  log('Request headers: %O', Object.fromEntries(req.headers.entries()));

  return fetchRequestHandler({
    // 避免请求之间互相影响
    // https://github.com/lobehub/lobe-chat/discussions/7442#discussioncomment-13658563
    allowBatching: false,

    /**
     * @link https://trpc.io/docs/v11/context
     */
    createContext: async () => {
      log('Creating async route context');
      try {
        const context = await createAsyncRouteContext(req);
        log('Async route context created successfully for userId: %s', context.userId);
        return context;
      } catch (error) {
        log('Failed to create async route context: %O', error);
        throw error;
      }
    },

    endpoint: '/trpc/async',

    onError: ({ error, path, type }) => {
      log('tRPC async route error - path: %s, type: %s, error: %O', path, type, error);
      pino.info(`Error in tRPC handler (async) on path: ${path}, type: ${type}`);
      console.error(error);
    },

    req,
    router: asyncRouter,
  });
};

export { handler as GET, handler as POST };
