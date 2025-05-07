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
export const fetchWithDesktopRemoteRPC = async (input: string, init?: RequestInit) => {
  if (isDesktop) {
    const res = await desktopRemoteRPCFetch(input as string, init);
    if (res) return res;
  }

  return fetch(input, init);
};
