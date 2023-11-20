import { PluginRequestPayload, createHeadersWithPluginSettings } from '@lobehub/chat-plugin-sdk';
import { merge } from 'lodash-es';

import { VISION_MODEL_WHITE_LIST } from '@/const/llm';
import { usePluginStore } from '@/store/plugin';
import { pluginSelectors } from '@/store/plugin/selectors';
import { initialLobeAgentConfig } from '@/store/session/initialState';
import type { OpenAIChatStreamPayload } from '@/types/openai/chat';
import { fetchAIFactory, getMessageError } from '@/utils/fetch';

import { createHeaderWithOpenAI } from './_header';
import { OPENAI_URLS, URLS } from './_url';

interface FetchOptions {
  signal?: AbortSignal | undefined;
}

class ChatService {
  getChatCompletion = (
    { plugins: enabledPlugins, ...params }: Partial<OpenAIChatStreamPayload>,
    options?: FetchOptions,
  ) => {
    const payload = merge(
      {
        model: initialLobeAgentConfig.model,
        stream: true,
        ...initialLobeAgentConfig.params,
      },
      params,
    );
    // ============   preprocess tools   ============ //

    const filterTools = pluginSelectors.enabledSchema(enabledPlugins)(usePluginStore.getState());

    // the rule that model can use tools:
    // 1. tools is not empty
    // 2. model is not in vision white list, because vision model can't use tools
    // TODO: we need to find some method to let vision model use tools
    const shouldUseTools =
      filterTools.length > 0 && !VISION_MODEL_WHITE_LIST.includes(payload.model);

    const functions = shouldUseTools ? filterTools : undefined;

    return fetch(OPENAI_URLS.chat, {
      body: JSON.stringify({ ...payload, functions }),
      headers: createHeaderWithOpenAI({ 'Content-Type': 'application/json' }),
      method: 'POST',
      signal: options?.signal,
    });
  };

  /**
   * run the plugin api to get result
   * @param params
   * @param options
   */
  runPluginApi = async (params: PluginRequestPayload, options?: FetchOptions) => {
    const { usePluginStore } = await import('@/store/plugin');

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

  fetchPresetTaskResult = fetchAIFactory(this.getChatCompletion);
}

export const chatService = new ChatService();
