import { merge } from 'lodash-es';

import { pluginSelectors, usePluginStore } from '@/store/plugin';
import { initialLobeAgentConfig } from '@/store/session/initialState';
import type { ChatCompletionFunctions, OpenAIChatStreamPayload } from '@/types/openai/chat';

import { createHeaderWithOpenAI } from './_header';
import { OPENAI_URLS } from './_url';

interface FetchChatModelOptions {
  signal?: AbortSignal | undefined;
}

/**
 * 专门用于对话的 fetch
 */
export const fetchChatModel = (
  { plugins: enabledPlugins, ...params }: Partial<OpenAIChatStreamPayload>,
  options?: FetchChatModelOptions,
) => {
  const payload = merge(
    {
      model: initialLobeAgentConfig.model,
      stream: true,
      ...initialLobeAgentConfig.params,
    },
    params,
  );
  // ============  1. 前置处理 functions   ============ //

  const filterFunctions: ChatCompletionFunctions[] = pluginSelectors.enabledSchema(enabledPlugins)(
    usePluginStore.getState(),
  );

  const functions = filterFunctions.length === 0 ? undefined : filterFunctions;

  return fetch(OPENAI_URLS.chat, {
    body: JSON.stringify({ ...payload, functions }),
    headers: createHeaderWithOpenAI({ 'Content-Type': 'application/json' }),
    method: 'POST',
    signal: options?.signal,
  });
};
