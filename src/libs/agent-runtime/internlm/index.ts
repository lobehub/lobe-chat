import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeInternLMAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://internlm-chat.intern-ai.org.cn/puyu/api/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      return {
        ...payload,
        stream: !payload.tools,
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_INTERNLM_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.InternLM,
});
