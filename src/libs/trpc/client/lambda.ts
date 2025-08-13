import { ModelProvider } from '@lobechat/model-runtime';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import debug from 'debug';
import superjson from 'superjson';

import { isDesktop } from '@/const/version';
import type { LambdaRouter } from '@/server/routers/lambda';

import { ErrorResponse } from './types';

const log = debug('lobe-image:lambda-client');

const links = [
  httpBatchLink({
    fetch: async (input, init) => {
      if (isDesktop) {
        const { desktopRemoteRPCFetch } = await import('@/utils/electron/desktopRemoteRPCFetch');

        // eslint-disable-next-line no-undef
        const res = await desktopRemoteRPCFetch(input as string, init as RequestInit);

        if (res) return res;
      }

      // eslint-disable-next-line no-undef
      const response = await fetch(input, init as RequestInit);

      if (response.ok) return response;

      const errorRes: ErrorResponse = await response.clone().json();

      const { loginRequired } = await import('@/components/Error/loginRequiredNotification');
      const { fetchErrorNotification } = await import('@/components/Error/fetchErrorNotification');

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

      let provider: ModelProvider = ModelProvider.OpenAI;
      // for image page, we need to get the provider from the store
      log('Getting provider from store for image page: %s', location.pathname);
      if (location.pathname === '/image') {
        const { getImageStoreState } = await import('@/store/image');
        const { imageGenerationConfigSelectors } = await import(
          '@/store/image/slices/generationConfig/selectors'
        );
        provider = imageGenerationConfigSelectors.provider(getImageStoreState()) as ModelProvider;
        log('Getting provider from store for image page: %s', provider);
      }

      // TODO: we need to support provider select for chat page
      const headers = await createHeaderWithAuth({ provider });
      log('Headers: %O', headers);
      return headers;
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
