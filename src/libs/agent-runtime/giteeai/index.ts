import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/modelProviders';

export interface GiteeAIModelCard {
  id: string;
}

export const LobeGiteeAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://ai.gitee.com/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_GITEE_AI_CHAT_COMPLETION === '1',
  },
  models: {
    transformModel: (m) => {
      const functionCallKeywords = [
        'Qwen2.5',
        'glm-4',
      ];

      const visionKeywords = [
        'InternVL',
        'Qwen2-VL',
      ];

      const model = m as unknown as GiteeAIModelCard;

      return {
        enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id.endsWith(m.id))?.enabled || false,
        functionCall: functionCallKeywords.some(keyword => model.id.includes(keyword)) && !model.id.includes('Qwen2.5-Coder'),
        id: model.id,
        vision: visionKeywords.some(keyword => model.id.includes(keyword)),
      };
    },
  },
  provider: ModelProvider.GiteeAI,
});
