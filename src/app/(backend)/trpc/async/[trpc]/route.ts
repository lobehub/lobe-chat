import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { NextRequest } from 'next/server';

import { pino } from '@/libs/logger';
import { createAsyncRouteContext } from '@/libs/trpc/async/context';
import { asyncRouter } from '@/server/routers/async';

export const maxDuration = 60;

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    /**
     * @link https://trpc.io/docs/v11/context
     */
    createContext: () => createAsyncRouteContext(req),

    endpoint: '/trpc/async',

    onError: ({ error, path, type }) => {
      pino.info(`Error in tRPC handler (async) on path: ${path}, type: ${type}`);
      console.error(error);
    },

    req,
    router: asyncRouter,
  });

export { handler as GET, handler as POST };
