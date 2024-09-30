import { ModelProvider } from '@/libs/agent-runtime';
import { genUserLLMConfig } from '@/utils/genUserLLMConfig';

export const DEFAULT_LLM_CONFIG = genUserLLMConfig({
  ollama: {
    enabled: true,
    fetchOnClient: true,
  },
  openai: {
    enabled: true,
  },
});

export const DEFAULT_MODEL = 'gpt-4o-mini';
export const DEFAULT_EMBEDDING_MODEL = { model: 'text-embedding-3-small', provider: 'openai' };

export const DEFAULT_PROVIDER = ModelProvider.OpenAI;
