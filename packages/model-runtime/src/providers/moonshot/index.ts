import { ModelProvider } from 'model-bank';

import {
  type OpenAICompatibleFactoryOptions,
  createOpenAICompatibleRuntime,
} from '../../core/openaiCompatibleFactory';
import { resolveParameters } from '../../core/parameterResolver';
import { ChatStreamPayload } from '../../types';
import { MODEL_LIST_CONFIGS, processModelList } from '../../utils/modelParse';

export interface MoonshotModelCard {
  id: string;
}

export const params = {
  baseURL: 'https://api.moonshot.cn/v1',
  chatCompletion: {
    handlePayload: (payload: ChatStreamPayload) => {
      const { enabledSearch, messages, temperature, tools, ...rest } = payload;

      // 为 assistant 空消息添加一个空格 (#8418)
      const filteredMessages = messages.map((message) => {
        if (message.role === 'assistant' && (!message.content || message.content === '')) {
          return { ...message, content: ' ' };
        }
        return message;
      });

      const moonshotTools = enabledSearch
        ? [
            ...(tools || []),
            {
              function: {
                name: '$web_search',
              },
              type: 'builtin_function',
            },
          ]
        : tools;

      // Resolve parameters with normalization
      const resolvedParams = resolveParameters({ temperature }, { normalizeTemperature: true });

      return {
        ...rest,
        messages: filteredMessages,
        temperature: resolvedParams.temperature,
        tools: moonshotTools,
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_MOONSHOT_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: MoonshotModelCard[] = modelsPage.data;

    return processModelList(modelList, MODEL_LIST_CONFIGS.moonshot, 'moonshot');
  },
  provider: ModelProvider.Moonshot,
} satisfies OpenAICompatibleFactoryOptions;

export const LobeMoonshotAI = createOpenAICompatibleRuntime(params);
