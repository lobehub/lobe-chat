import { createOpenAICompatibleRuntime } from '../../core/openaiCompatibleFactory';
import { AgentRuntimeErrorType, ChatCompletionErrorPayload, ModelProvider } from '../../types';
import { processMultiProviderModelList } from '../../utils/modelParse';

export interface VercelAIGatewayModelCard {
  id: string;
  created?: number | string;
  name?: string;
  description?: string;
  context_window?: number;
  max_tokens?: number;
  tags?: string[];
  pricing?: {
    input?: string | number;
    output?: string | number;
  };
}

const formatPrice = (price?: string | number) => {
  if (price === undefined || price === null) return undefined;
  const n = typeof price === 'number' ? price : Number(price);
  if (Number.isNaN(n)) return undefined;
  // Convert per-token price (USD) to per million tokens
  return Number((n * 1e6).toPrecision(5));
};

export const LobeVercelAIGatewayAI = createOpenAICompatibleRuntime({
  baseURL: 'https://ai-gateway.vercel.sh/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { model, ...rest } = payload;
      return {
        ...rest,
        model,
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_VERCELAIGATEWAY_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: VercelAIGatewayModelCard[] = modelsPage.data;

    const formattedModels = (modelList || []).map((m) => {
      const tags = Array.isArray(m.tags) ? m.tags : [];

      const inputPrice = formatPrice(m.pricing?.input);
      const outputPrice = formatPrice(m.pricing?.output);
      let displayName = m.name ?? m.id;
      if (inputPrice === 0 && outputPrice === 0) {
        displayName += ' (free)';
      }

      return {
        id: m.id,
        created: m.created,
        contextWindowTokens: m.context_window ?? undefined,
        description: m.description ?? '',
        displayName,
        functionCall: tags.includes('tool-use') || false,
        maxOutput: typeof m.max_tokens === 'number' ? m.max_tokens : undefined,
        pricing: {
          input: inputPrice,
          output: outputPrice,
        },
        reasoning: tags.includes('reasoning') || false,
        vision: tags.includes('vision') || false,
      } as any;
    });

    return await processMultiProviderModelList(formattedModels, 'vercelaigateway');
  },
  provider: ModelProvider.VercelAIGateway,
});
