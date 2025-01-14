import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';

export interface SiliconCloudModelCard {
  id: string;
}

export const LobeSiliconCloudAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.siliconflow.cn/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      return {
        ...payload,
        stream: !payload.tools,
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_SILICONCLOUD_CHAT_COMPLETION === '1',
  },
  models: {
    transformModel: (m) => {
      const functionCallKeywords = [
        'qwen/qwen2.5',
        'thudm/glm-4',
        'deepseek-ai/deepSeek',
        'internlm/internlm2_5',
        'meta-llama/meta-llama-3.1',
        'meta-llama/meta-llama-3.3',
      ];

      const visionKeywords = [
        'opengvlab/internvl',
        'qwen/qwen2-vl',
        'teleai/telemm',
        'deepseek-ai/deepseek-vl',
      ];

      const model = m as unknown as SiliconCloudModelCard;

      return {
        enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id.endsWith(m.id))?.enabled || false,
        functionCall: functionCallKeywords.some(keyword => model.id.toLowerCase().includes(keyword)),
        id: model.id,
        vision: visionKeywords.some(keyword => model.id.toLowerCase().includes(keyword)),
      };
    },
  },
  provider: ModelProvider.SiliconCloud,
});
