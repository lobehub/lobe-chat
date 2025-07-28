import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { NextRequest } from 'next/server';

import { pino } from '@/libs/logger';
import { createLambdaContext } from '@/libs/trpc/lambda/context';
import { toolsRouter } from '@/server/routers/tools';

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    /**
     * @link https://trpc.io/docs/v11/context
     */
    createContext: () => createLambdaContext(req),

    endpoint: '/trpc/tools',

    onError: ({ error, path, type }) => {
      pino.info(`Error in tRPC handler (tools) on path: ${path}, type: ${type}`);
      console.error(error);
    },

    req,
    router: toolsRouter,
  });

export { handler as GET, handler as POST };
