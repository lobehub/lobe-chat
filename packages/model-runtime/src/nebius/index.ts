import { ModelProvider } from '../types';
import { processMultiProviderModelList } from '../utils/modelParse';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';

export interface NebiusModelCard {
  id: string;
}

export const LobeNebiusAI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.studio.nebius.com/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_NEBIUS_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const base = (client as any).baseURL || 'https://api.studio.nebius.com/v1';
    const url = `${base.replace(/\/+$/, '')}/models?verbose=true`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${client.apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Nebius models: ${res.status} ${res.statusText}`);
    }

    const body = (await res.json()) as any;
    const rawList = body?.data ?? [];

    const standardList = rawList.map((m: any) => {
      const modality = m.architecture?.modality;
      let inferredType: string | undefined = undefined;

      if (typeof modality === 'string' && modality.includes('->')) {
        const parts = modality.split('->');
        const right = parts[1]?.trim().toLowerCase();
        if (right === 'image') {
          inferredType = 'image';
        }
        if (right === 'embedding') {
          inferredType = 'embedding';
        }
      }

      return {
        id: m.id,
        displayName: m.name ?? m.id,
        description: m.description ?? '',
        created: typeof m.created === 'number' ? m.created : undefined,
        contextWindowTokens: m.context_length ?? undefined,
        type: inferredType,
      };
    });

    return processMultiProviderModelList(standardList, 'nebius');
  },
  provider: ModelProvider.Nebius,
});
