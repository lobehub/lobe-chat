import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { NextRequest } from 'next/server';

import { pino } from '@/libs/logger';
import { createLambdaContext } from '@/libs/trpc/lambda/context';
import { prepareRequestForTRPC } from '@/libs/trpc/utils/request-adapter';
import { lambdaRouter } from '@/server/routers/lambda';

const handler = (req: NextRequest) => {
  // Clone the request to avoid "Response body object should not be disturbed or locked" error
  // in Next.js 16 when the body stream has been consumed by Next.js internal mechanisms
  const preparedReq = prepareRequestForTRPC(req);

  return fetchRequestHandler({
    /**
     * @link https://trpc.io/docs/v11/context
     */
    createContext: () => createLambdaContext(req),

    endpoint: '/trpc/lambda',

    onError: ({ error, path, type }) => {
      pino.info(`Error in tRPC handler (lambda) on path: ${path}, type: ${type}`);
      console.error(error);
    },

    req: preparedReq,
    responseMeta({ ctx }) {
      const headers = ctx?.resHeaders;

      return { headers };
    },
    router: lambdaRouter,
  });
};

export { handler as GET, handler as POST };
