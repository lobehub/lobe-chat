import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeVolcengineAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  chatCompletion: {
    handlePayload: (payload) => {
      const { model, thinking, ...rest } = payload;

      return {
        ...rest,
        model,
        ...(['thinking-vision-pro'].some((keyword) => model.toLowerCase().includes(keyword))
          ? {
              thinking:
                thinking !== undefined && thinking.type === 'enabled'
                  ? { type: 'enabled' }
                  : { type: 'disabled' },
            }
          : {}),
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_VOLCENGINE_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Volcengine,
});
