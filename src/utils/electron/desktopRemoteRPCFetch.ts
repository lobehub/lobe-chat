import { ProxyTRPCRequestParams, dispatch } from '@lobechat/electron-client-ipc';
import debug from 'debug';

import { isDesktop } from '@/const/version';
import { getElectronStoreState } from '@/store/electron';
import { electronSyncSelectors } from '@/store/electron/selectors';
import { getRequestBody, headersToRecord } from '@/utils/fetch';

const log = debug('lobe-lambda:desktopRemoteRPCFetch');

// eslint-disable-next-line no-undef
export const desktopRemoteRPCFetch = async (input: string, init?: RequestInit) => {
  const isSyncActive = electronSyncSelectors.isSyncActive(getElectronStoreState());
  log('isSyncActive:', isSyncActive);

  if (isSyncActive) {
    log('Using IPC proxy for tRPC request');
    try {
      const url = input as string;
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

      log('Received IPC proxy response:', { status: ipcResult.status });
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
};

// eslint-disable-next-line no-undef
export const fetchWithDesktopRemoteRPC = (async (input: RequestInfo | URL, init?: RequestInit) => {
  if (isDesktop) {
    const res = await desktopRemoteRPCFetch(input as string, init);
    if (res) return res;
  }

  return fetch(input, init);
}) as typeof fetch;

// eslint-disable-next-line no-undef
export const fetchWithInvokeStream = async (input: RequestInfo | URL, init?: RequestInit) => {
  if (isDesktop) {
    const isSyncActive = electronSyncSelectors.isSyncActive(getElectronStoreState());
    log('isSyncActive:', isSyncActive);
    if (isSyncActive) {
      log('Using IPC stream proxy for request to:', input);
      try {
        // 步骤 2: 准备请求参数，这部分逻辑与你提供的参考代码一致
        const url = input.toString();
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

        // 步骤 3: 调用在 preload 中定义的 invokeStream 方法
        // 这是核心区别：invokeStream 直接返回一个 Promise<Response>
        // 我们不再需要手动构建 Response 对象
        const response = await window.electronAPI.invokeStream(params);

        log('Received IPC stream response object:', { status: response.status });

        // 可选：你仍然可以保留对失败响应的警告
        if (!response.ok) {
          console.warn(
            '[lambda] IPC stream proxy response indicates an error:',
            response.status,
            response.statusText,
          );
        }

        return response;
      } catch (error) {
        // 步骤 4: 捕获在 IPC 通信过程中可能发生的任何错误
        console.error('[lambda] Error during IPC stream proxy call:', error);

        // 返回一个标准的错误 Response 对象，以保持接口一致性
        return new Response(
          `IPC Stream Proxy Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          {
            status: 500,
            statusText: 'IPC Stream Proxy Error',
          },
        );
      }
    }
  }

  return fetch(input, init);
};
