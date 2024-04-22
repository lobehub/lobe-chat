import { TogetherAIModel } from '@/libs/agent-runtime/togetherai/type';

import { AgentRuntimeErrorType } from '../error';
import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

const baseURL = 'https://api.together.xyz';
export const LobeTogetherAI = LobeOpenAICompatibleFactory({
  baseURL: `${baseURL}/v1`,
  constructorOptions: {
    defaultHeaders: {
      'HTTP-Referer': 'https://chat-preview.lobehub.com',
      'X-Title': 'Lobe Chat',
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_TOGETHERAI_CHAT_COMPLETION === '1',
  },
  errorType: {
    bizError: AgentRuntimeErrorType.TogetherAIBizError,
    invalidAPIKey: AgentRuntimeErrorType.InvalidTogetherAIAPIKey,
  },
  models: async ({ apiKey }) => {
    const data = await fetch(`${baseURL}/api/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    if (!data.ok) {
      throw new Error(`Together Fetch Error: ${data.statusText || data.status}`);
    }

    const models: TogetherAIModel[] = await data.json();

    return models.map((model) => {
      return {
        description: model.description,
        displayName: model.display_name,
        enabled: true,
        functionCall: model.description.includes('function calling'),
        id: model.name,
        maxOutput: model.context_length,
        tokens: model.context_length,
        vision: model.description.includes('vision') || model.name.includes('vision'),
      };
    });
  },
  provider: ModelProvider.TogetherAI,
});
