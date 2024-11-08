import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { NextRequest } from 'next/server';

import { pino } from '@/libs/logger';
import { createContext } from '@/server/context';
import { edgeRouter } from '@/server/routers/edge';

export const runtime = 'edge';

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    /**
     * @link https://trpc.io/docs/v11/context
     */
    createContext: () => createContext(req),

    endpoint: '/trpc/edge',

    onError: ({ error, path }) => {
      pino.info(`Error in tRPC handler (edge) on path: ${path}`);
      console.error(error);
    },

    req,
    router: edgeRouter,
  });

export { handler as GET, handler as POST };
