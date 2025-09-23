import { TRPCLink, createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { observable } from '@trpc/server/observable';
import debug from 'debug';
import { ModelProvider } from 'model-bank';
import superjson from 'superjson';

import { isDesktop } from '@/const/version';
import type { LambdaRouter } from '@/server/routers/lambda';

const log = debug('lobe-image:lambda-client');

// handle error
const errorHandlingLink: TRPCLink<LambdaRouter> = () => {
  return ({ op, next }) =>
    observable((observer) =>
      next(op).subscribe({
        complete: () => observer.complete(),
        error: async (err) => {
          const showError = (op.context?.showNotification as boolean) ?? true;

          if (showError) {
            const status = err.data?.httpStatus as number;

            const { loginRequired } = await import('@/components/Error/loginRequiredNotification');
            const { fetchErrorNotification } = await import(
              '@/components/Error/fetchErrorNotification'
            );

            switch (status) {
              case 401: {
                loginRequired.redirect();
                break;
              }

              default: {
                fetchErrorNotification.error({ errorMessage: err.message, status });
              }
            }
          }

          observer.error(err);
        },
        next: (value) => observer.next(value),
      }),
    );
};

// 2. httpBatchLink
const customHttpBatchLink = httpBatchLink({
  fetch: async (input, init) => {
    if (isDesktop) {
      const { desktopRemoteRPCFetch } = await import('@/utils/electron/desktopRemoteRPCFetch');

      // eslint-disable-next-line no-undef
      const res = await desktopRemoteRPCFetch(input as string, init as RequestInit);

      if (res) return res;
    }

    // eslint-disable-next-line no-undef
    return await fetch(input, init as RequestInit);
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
});

// 3. assembly links
const links = [errorHandlingLink, customHttpBatchLink];

export const lambdaClient = createTRPCClient<LambdaRouter>({
  links,
});

export const lambdaQuery = createTRPCReact<LambdaRouter>();

export const lambdaQueryClient = lambdaQuery.createClient({ links });
