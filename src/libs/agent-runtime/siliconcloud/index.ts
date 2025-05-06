import type { ChatModelCard } from '@/types/llm';

import { AgentRuntimeErrorType } from '../error';
import { ChatCompletionErrorPayload, ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

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
            message:
              '请检查 API Key 余额是否充足，或者是否在用未实名的 API Key 访问需要实名的模型。',
          };
        }
      }
      return {
        error,
      };
    },
    handlePayload: (payload) => {
      const { max_tokens, model, thinking, ...rest } = payload;
      const thinkingBudget =
        thinking?.budget_tokens === 0 ? 1 : thinking?.budget_tokens || undefined;

      return {
        ...rest,
        ...(['qwen3'].some((keyword) => model.toLowerCase().includes(keyword))
          ? {
              enable_thinking: thinking !== undefined ? thinking.type === 'enabled' : false,
              thinking_budget:
                thinkingBudget === undefined
                  ? undefined
                  : Math.min(Math.max(thinkingBudget, 1), 32_768),
            }
          : {}),
        max_tokens:
          max_tokens === undefined ? undefined : Math.min(Math.max(max_tokens, 1), 16_384),
        model,
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
  models: async ({ client }) => {
    const { LOBE_DEFAULT_MODEL_LIST } = await import('@/config/aiModels');

    const functionCallKeywords = [
      'qwen/qwen3',
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
      'qwen/qwen3',
    ];

    const modelsPage = (await client.models.list()) as any;
    const modelList: SiliconCloudModelCard[] = modelsPage.data;

    return modelList
      .map((model) => {
        const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
          (m) => model.id.toLowerCase() === m.id.toLowerCase(),
        );

        return {
          contextWindowTokens: knownModel?.contextWindowTokens ?? undefined,
          displayName: knownModel?.displayName ?? undefined,
          enabled: knownModel?.enabled || false,
          functionCall:
            (functionCallKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) &&
              !model.id.toLowerCase().includes('deepseek-r1')) ||
            knownModel?.abilities?.functionCall ||
            false,
          id: model.id,
          reasoning:
            reasoningKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) ||
            knownModel?.abilities?.reasoning ||
            false,
          vision:
            visionKeywords.some((keyword) => model.id.toLowerCase().includes(keyword)) ||
            knownModel?.abilities?.vision ||
            false,
        };
      })
      .filter(Boolean) as ChatModelCard[];
  },
  provider: ModelProvider.SiliconCloud,
});
