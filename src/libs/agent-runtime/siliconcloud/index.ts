import { AgentRuntimeErrorType } from '../error';
import { ChatCompletionErrorPayload, ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';

export interface SiliconCloudModelCard {
  id: string;
}

export const LobeSiliconCloudAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.siliconflow.cn/v1',
  chatCompletion: {
    handleError: (error: any): Omit<ChatCompletionErrorPayload, 'provider'> | undefined => {
      let errorResponse: Response | undefined;
      if (error instanceof Response) {
        errorResponse = error;
      } else if ('status' in (error as any)) {
        errorResponse = error as Response;
      }
      if (errorResponse) {
        if (errorResponse.status === 401) {
          return {
            error: errorResponse.status,
            errorType: AgentRuntimeErrorType.InvalidProviderAPIKey,
          };
        }

        if (errorResponse.status === 403) {
          return {
            error: errorResponse.status,
            errorType: AgentRuntimeErrorType.ProviderBizError,
            message: '请检查 API Key 余额是否充足，或者是否在用未实名的 API Key 访问需要实名的模型。',
          };
        }
      }
      return {
        error,
      };
    },
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
  errorType: {
    bizError: AgentRuntimeErrorType.ProviderBizError,
    invalidAPIKey: AgentRuntimeErrorType.InvalidProviderAPIKey,
  },
  models: {
    transformModel: (m) => {
      const functionCallKeywords = [
        'qwen/qwen2.5',
        'thudm/glm-4',
        'deepseek-ai/deepseek',
        'internlm/internlm2_5',
        'meta-llama/meta-llama-3.1',
        'meta-llama/meta-llama-3.3',
      ];

      const visionKeywords = [
        'opengvlab/internvl',
        'qwen/qvq',
        'qwen/qwen2-vl',
        'teleai/telemm',
        'deepseek-ai/deepseek-vl',
      ];

      const reasoningKeywords = [
        'deepseek-ai/deepseek-r1',
        'qwen/qvq',
        'qwen/qwq',
      ];

      const model = m as unknown as SiliconCloudModelCard;

      return {
        contextWindowTokens: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id)?.contextWindowTokens ?? undefined,
        displayName: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id)?.displayName ?? undefined,
        enabled: LOBE_DEFAULT_MODEL_LIST.find((m) => model.id === m.id)?.enabled || false,
        functionCall: functionCallKeywords.some(keyword => model.id.toLowerCase().includes(keyword)) && !model.id.toLowerCase().includes('deepseek-r1'),
        id: model.id,
        reasoning: reasoningKeywords.some(keyword => model.id.toLowerCase().includes(keyword)),
        vision: visionKeywords.some(keyword => model.id.toLowerCase().includes(keyword)),
      };
    },
  },
  provider: ModelProvider.SiliconCloud,
});
