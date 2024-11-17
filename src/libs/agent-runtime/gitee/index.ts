import OpenAI from 'openai';

import { ChatStreamPayload, ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeGiteeAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://ai.gitee.com/v1',
  chatCompletion: {
    handlePayload: ({ model, top_p, ...payload }: ChatStreamPayload) =>
      ({
        ...payload,
        model,
        ...(model === "code-raccoon-v1" ? {
          top_p: (top_p !== undefined && top_p > 0 && top_p < 1) ? top_p : undefined,
        } : {
          top_p,
        }),
      }) as OpenAI.ChatCompletionCreateParamsStreaming,
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_GITEE_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Gitee,
});
