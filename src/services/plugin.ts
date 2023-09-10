import { PluginRequestPayload, createHeadersWithPluginSettings } from '@lobehub/chat-plugin-sdk';

import { pluginSelectors, usePluginStore } from '@/store/plugin';
import { getMessageError } from '@/utils/fetch';

import { URLS } from './_url';

interface FetchChatModelOptions {
  signal?: AbortSignal | undefined;
  withPlugin?: boolean;
}

/**
 * 请求插件结果´
 */
export const fetchPlugin = async (
  params: PluginRequestPayload,
  options?: FetchChatModelOptions,
) => {
  const s = usePluginStore.getState();

  const settings = pluginSelectors.getPluginSettingsById(params.identifier)(s);
  const manifest = pluginSelectors.getPluginManifestById(params.identifier)(s);

  const gatewayURL = manifest?.gateway;

  const res = await fetch(gatewayURL ?? URLS.plugins, {
    body: JSON.stringify({ ...params, manifest }),
    headers: createHeadersWithPluginSettings(settings),
    method: 'POST',
    signal: options?.signal,
  });

  if (!res.ok) {
    throw await getMessageError(res);
  }

  return await res.text();
};
