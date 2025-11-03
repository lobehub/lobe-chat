import {
  TRPCLink,
  createTRPCClient,
  httpBatchLink,
  httpSubscriptionLink,
  splitLink,
} from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { observable } from '@trpc/server/observable';
import debug from 'debug';
import { ModelProvider } from 'model-bank';
import superjson from 'superjson';

import { isDesktop } from '@/const/version';
import type { LambdaRouter } from '@/server/routers/lambda';

const log = debug('lobe-image:lambda-client');

// 401 error debouncing: prevent showing multiple login notifications in short time
let last401Time = 0;
const MIN_401_INTERVAL = 5000; // 5 seconds

// handle error
const errorHandlingLink: TRPCLink<LambdaRouter> = () => {
  return ({ op, next }) =>
    observable((observer) =>
      next(op).subscribe({
        complete: () => observer.complete(),
        error: async (err) => {
          // Check if this is an abort error and should be ignored
          const isAbortError =
            err.message.includes('aborted') ||
            err.name === 'AbortError' ||
            err.cause?.name === 'AbortError' ||
            err.message.includes('signal is aborted without reason');

          const showError = (op.context?.showNotification as boolean) ?? true;
          const status = err.data?.httpStatus as number;

          // Don't show notifications for abort errors
          if (showError && !isAbortError) {
            const { loginRequired } = await import('@/components/Error/loginRequiredNotification');
            const { fetchErrorNotification } = await import(
              '@/components/Error/fetchErrorNotification'
            );

            switch (status) {
              case 401: {
                // Debounce: only show login notification once every 5 seconds
                const now = Date.now();
                if (now - last401Time > MIN_401_INTERVAL) {
                  last401Time = now;
                  loginRequired.redirect();
                }
                // Mark error as non-retryable to prevent SWR infinite retry loop
                err.meta = { ...err.meta, shouldRetry: false };
                break;
              }

              default: {
                if (fetchErrorNotification)
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

// 封装通用的 fetch 和 headers 逻辑，以便复用
const getTrpcClientOptions = () => ({
  fetch: async (input: Parameters<typeof fetch>[0] | URL, init?: Parameters<typeof fetch>[1]) => {
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

    let provider: ModelProvider | undefined;
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

    // Only include provider in JWT for image operations
    // For other operations (like knowledge base embedding), let server use its own config
    const headers = await createHeaderWithAuth(provider ? { provider } : undefined);
    log('Headers: %O', headers);
    return headers;
  },
  transformer: superjson,
});

// 2. 创建一个用于 query 和 mutation 的 Link (可以是 httpBatchLink 或 httpLink)
const mainHttpLink = httpBatchLink({
  ...getTrpcClientOptions(),
  maxURLLength: 2083,
  url: '/trpc/lambda',
});

// 3. 创建一个专门用于 subscription 的 Link
const subscriptionLink = httpSubscriptionLink({
  ...getTrpcClientOptions(),
  url: '/trpc/lambda',
});

// 4. 使用 splitLink 来根据操作类型分发请求
const splitRouterLink = splitLink({
  condition: (op) => {
    // 如果是 subscription 操作，返回 true
    return op.type === 'subscription';
  },

  // 当 condition 返回 false 时，，使用 mainHttpLink
  false: mainHttpLink,

  // 当 condition 返回 true 时，使用 subscriptionLink
  true: subscriptionLink,
});

// 5. 组装最终的 links 数组
const links = [errorHandlingLink, splitRouterLink];

export const lambdaClient = createTRPCClient<LambdaRouter>({
  links,
});

export const lambdaQuery = createTRPCReact<LambdaRouter>();

export const lambdaQueryClient = lambdaQuery.createClient({ links });
