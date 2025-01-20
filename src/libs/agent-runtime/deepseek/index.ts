import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeDeepSeekAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.deepseek.com/v1',
  chatCompletion: {
    handlePayload: ({ model, presence_penalty, ...payload }: ChatStreamPayload) =>
      ({
        ...payload,
        model,
        ...(model === 'deepseek-reasoner'
          ? { presence_penalty: undefined }
          : { presence_penalty }),
      }) as OpenAI.ChatCompletionCreateParamsStreaming,
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_DEEPSEEK_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.DeepSeek,
});
