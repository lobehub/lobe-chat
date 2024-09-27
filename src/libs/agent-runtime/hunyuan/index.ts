import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeHunyuanAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.hunyuan.cloud.tencent.com/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_HUNYUAN_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Hunyuan,
});
