import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';

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
        'qwen2.5',
        'glm-4',
      ];

      const visionKeywords = [
        'internvl',
        'qwen2-vl',
      ];

      const reasoningKeywords = [
        'deepseek-r1',
        'qwq',
      ];

      const model = m as unknown as GiteeAIModelCard;

      return {
        contextWindowTokens: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id)?.contextWindowTokens ?? undefined,
        displayName: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id)?.displayName ?? undefined,
        enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id)?.enabled || false,
        functionCall: functionCallKeywords.some(keyword => model.id.toLowerCase().includes(keyword)) && !model.id.toLowerCase().includes('qwen2.5-coder'),
        id: model.id,
        reasoning: reasoningKeywords.some(keyword => model.id.toLowerCase().includes(keyword)),
        vision: visionKeywords.some(keyword => model.id.toLowerCase().includes(keyword)),
      };
    },
  },
  provider: ModelProvider.GiteeAI,
});
