import { ProxyTRPCRequestParams, dispatch } from '@lobechat/electron-client-ipc';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';

import { isDesktop } from '@/const/version';
import { ModelProvider } from '@/libs/agent-runtime';
import type { LambdaRouter } from '@/server/routers/lambda';
import { getElectronStoreState } from '@/store/electron';
import { electronSyncSelectors } from '@/store/electron/selectors';

import { ErrorResponse } from './types';

const headersToRecord = (headersInit?: HeadersInit): Record<string, string> => {
  const record: Record<string, string> = {};
  if (!headersInit) {
    return record;
  }
  if (headersInit instanceof Headers) {
    headersInit.forEach((value, key) => {
      record[key] = value;
    });
  } else if (Array.isArray(headersInit)) {
    headersInit.forEach(([key, value]) => {
      record[key] = value;
    });
  } else {
    Object.assign(record, headersInit);
  }
  delete record['host'];
  delete record['connection'];
  delete record['content-length'];
  return record;
};

const getRequestBody = async (
  body?: BodyInit | null,
): Promise<string | ArrayBuffer | undefined> => {
  if (!body) {
    return undefined;
  }
  if (typeof body === 'string') {
    return body;
  }
  if (body instanceof ArrayBuffer) {
    return body;
  }
  if (ArrayBuffer.isView(body)) {
    return body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength);
  }
  if (body instanceof Blob) {
    return await body.arrayBuffer();
  }
  console.warn('Unsupported request body type for IPC proxy:', typeof body);
  throw new Error('Unsupported request body type for IPC proxy');
};

const links = [
  httpBatchLink({
    fetch: async (input, init) => {
      if (isDesktop) {
        const isSyncActive = electronSyncSelectors.isSyncActive(getElectronStoreState());
        console.log('[lambda] isDesktop:', isDesktop, 'isSyncActive:', isSyncActive);

        if (isSyncActive) {
          console.log('[lambda] Using IPC proxy for tRPC request');
          try {
            const url = typeof input === 'string' ? input : input.url;
            const parsedUrl = new URL(url, window.location.origin);
            const urlPath = parsedUrl.pathname + parsedUrl.search;
            const method = init?.method?.toUpperCase() || 'GET';
            const headers = headersToRecord(init?.headers);
            const body = await getRequestBody(init?.body);

            const params: ProxyTRPCRequestParams = {
              body,
              headers,
              method,
              urlPath,
            };

            const ipcResult = await dispatch('proxyTRPCRequest', params);

            console.log('[lambda] Received IPC proxy response:', { status: ipcResult.status });
            const response = new Response(ipcResult.body, {
              headers: ipcResult.headers,
              status: ipcResult.status,
              statusText: ipcResult.statusText,
            });

            if (!response.ok) {
              console.warn(
                '[lambda] IPC proxy response indicates an error:',
                response.status,
                response.statusText,
              );
            }

            return response;
          } catch (error) {
            console.error('[lambda] Error during IPC proxy call:', error);
            return new Response(
              `IPC Proxy Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              {
                status: 500,
                statusText: 'IPC Proxy Error',
              },
            );
          }
        }
      }

      console.log('[lambda] Using standard fetch for request:', input);
      const response = await fetch(input, init);

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
