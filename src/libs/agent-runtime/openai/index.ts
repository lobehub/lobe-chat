import { ChatStreamPayload, ModelProvider, OpenAIChatMessage } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const pruneReasoningPayload = (payload: ChatStreamPayload) => {
  // TODO: 临时写法，后续要重构成 model card 展示配置
  const disableStreamModels = new Set([
    'o1',
    'o1-2024-12-17'
  ]);
  const systemToUserModels = new Set([
    'o1-preview',
    'o1-preview-2024-09-12',
    'o1-mini',
    'o1-mini-2024-09-12',
  ]);

  return {
    ...payload,
    frequency_penalty: 0,
    messages: payload.messages.map((message: OpenAIChatMessage) => ({
      ...message,
      role:
        message.role === 'system'
          ? systemToUserModels.has(payload.model)
            ? 'user'
            : 'developer'
          : message.role,
    })),
    presence_penalty: 0,
    stream: !disableStreamModels.has(payload.model),
    temperature: 1,
    top_p: 1,
  };
};

export const LobeOpenAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.openai.com/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { model } = payload;

      if (model.startsWith('o1') || model.startsWith('o3')) {
        return pruneReasoningPayload(payload) as any;
      }

      return { ...payload, stream: payload.stream ?? true };
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_OPENAI_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.OpenAI,
});
