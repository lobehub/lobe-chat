import { ChatStreamPayload, ModelProvider, OpenAIChatMessage } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

// TODO: 临时写法，后续要重构成 model card 展示配置
const o1Models = new Set(['o1-preview', 'o1-mini']);
const truneO1Payload = (payload: ChatStreamPayload) => ({
  ...payload,
  frequency_penalty: 0,
  messages: payload.messages.map((message: OpenAIChatMessage) => ({
    ...message,
    role: message.role === 'system' ? 'user' : message.role,
  })),
  presence_penalty: 0,
  stream: false,
  temperature: 1,
  top_p: 1,
});

export const LobeOpenAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.openai.com/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { model } = payload;

      if (o1Models.has(model)) {
        return truneO1Payload(payload) as any;
      }

      return { ...payload, stream: payload.stream ?? true };
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_OPENAI_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.OpenAI,
});
