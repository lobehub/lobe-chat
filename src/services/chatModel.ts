import { merge } from 'lodash-es';

import { VISION_MODEL_WHITE_LIST } from '@/const/llm';
import { pluginSelectors, usePluginStore } from '@/store/plugin';
import { initialLobeAgentConfig } from '@/store/session/initialState';
import type { OpenAIChatStreamPayload } from '@/types/openai/chat';

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
  // ============   preprocess tools   ============ //

  const filterTools = pluginSelectors.enabledSchema(enabledPlugins)(usePluginStore.getState());

  // the rule that model can use tools:
  // 1. tools is not empty
  // 2. model is not in vision white list, because vision model can't use tools
  // TODO: we need to find some method to let vision model use tools
  const shouldUseTools = filterTools.length > 0 && !VISION_MODEL_WHITE_LIST.includes(payload.model);

  const functions = shouldUseTools ? filterTools : undefined;

  return fetch(OPENAI_URLS.chat, {
    body: JSON.stringify({ ...payload, functions }),
    headers: createHeaderWithOpenAI({ 'Content-Type': 'application/json' }),
    method: 'POST',
    signal: options?.signal,
  });
};
