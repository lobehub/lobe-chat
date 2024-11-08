import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';

import { fetchErrorNotification } from '@/components/Error/fetchErrorNotification';
import { loginRequired } from '@/components/Error/loginRequiredNotification';
import { ModelProvider } from '@/libs/agent-runtime';
import type { LambdaRouter } from '@/server/routers/lambda';

import { ErrorResponse } from './types';

const links = [
  httpBatchLink({
    fetch: async (input, init) => {
      const response = await fetch(input, init);
      if (response.ok) return response;

      const errorRes: ErrorResponse = await response.clone().json();

      errorRes.forEach((item) => {
        const errorData = item.error.json;

        const status = errorData.data.httpStatus;

        switch (status) {
          case 401: {
            loginRequired.redirect();
            break;
          }
          default: {
            fetchErrorNotification.error({ errorMessage: errorData.message, status });
          }
        }
      });

      return response;
    },
    headers: async () => {
      // dynamic import to avoid circular dependency
      const { createHeaderWithAuth } = await import('@/services/_auth');

      // TODO: we need to support provider select
      return createHeaderWithAuth({ provider: ModelProvider.OpenAI });
    },
    maxURLLength: 2083,
    transformer: superjson,
    url: '/trpc/lambda',
  }),
];

export const lambdaClient = createTRPCClient<LambdaRouter>({
  links,
});

export const lambdaQuery = createTRPCReact<LambdaRouter>();

export const lambdaQueryClient = lambdaQuery.createClient({ links });
